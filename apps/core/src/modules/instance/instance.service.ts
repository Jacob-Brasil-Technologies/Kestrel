import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameType, getConfigurations, getGameTypeDetails, TGameVariant } from '@kestrel/types';
import { ensureDir, remove, writeFile } from 'fs-extra';
import { join, resolve } from 'path';
import { Repository } from 'typeorm';
import { RuntimeService } from '../runtime/runtime.service';
import { VariantService } from '../variant/variant.service';
import { CreateInstanceInput } from './dto/create-instance.input';
import { InstanceStatus } from '../../shared/enums';
import { Instance } from './instance.entity';

@Injectable()
export class InstanceService {
	private readonly logger = new Logger('InstanceService');

	constructor(
		@InjectRepository(Instance)
		private readonly instanceRepository: Repository<Instance>,
		private readonly runtimeService: RuntimeService,
		private readonly variantService: VariantService,
	) {}

	private get instancesRoot(): string {
		return join(process.cwd(), 'data', 'instances');
	}

	private validatePath(targetPath: string): void {
		const resolved = resolve(targetPath);
		const root = resolve(this.instancesRoot);
		if (!resolved.startsWith(root + '/') && resolved !== root) {
			throw new Error('Path traversal detected: instance path must be within the instances directory');
		}
	}

	/** Resolve template placeholders (e.g. {{MAX_MEMORY}}) in arg strings */
	private resolveArgs(args: string[], input: CreateInstanceInput): string[] {
		return args.map((arg) => arg.replace('{{MAX_MEMORY}}', `${input.maxMemory ?? 2048}M`).replace('{{MIN_MEMORY}}', `${input.minMemory ?? 1024}M`));
	}

	/** Generate config files (eula.txt, server.properties, etc.) from @kestrel/types definitions */
	private async generateConfigFiles(instanceDir: string, gameType: GameType, overrides?: Record<string, string>): Promise<void> {
		const configs = getConfigurations(gameType);
		for (const config of configs) {
			const lines = config.lines
				.filter((line) => line.default !== undefined)
				.map((line) => {
					const value = overrides?.[line.linePrefix] ?? line.default!;
					return `${line.linePrefix}${value}`;
				});
			await writeFile(join(instanceDir, config.filePath), lines.join('\n') + '\n');
		}
	}

	public async availableServerVersions(gameType: GameType, variant: TGameVariant): Promise<string[]> {
		return this.variantService.with(gameType, variant).availableVersions();
	}

	public async createInstance(input: CreateInstanceInput): Promise<Instance> {
		const gameDetails = getGameTypeDetails(input.gameType);

		// Validate that the current platform is supported for this game
		const currentPlatform = process.platform === 'win32' ? 'windows' : process.platform;
		if (!gameDetails.supportedPlatforms.includes(currentPlatform)) {
			throw new Error(
				`${gameDetails.name} servers are not supported on ${currentPlatform}. Supported platforms: ${gameDetails.supportedPlatforms.join(', ')}`,
			);
		}

		this.logger.log(`Ensuring ${String(gameDetails.runtime)} ${input.runtimeVersion} is installed...`);
		const runtime = await this.runtimeService.with(gameDetails.runtime).ensureInstalled(input.runtimeVersion);

		const instance = this.instanceRepository.create({
			name: input.name,
			gameType: input.gameType,
			variant: input.variant,
			variantVersion: input.variantVersion,
			runtime,
			status: InstanceStatus.STOPPED,
		});

		const instanceDir = join(this.instancesRoot, instance.id);
		this.validatePath(instanceDir);
		instance.instancePath = instanceDir;

		await ensureDir(instanceDir);

		try {
			const provider = this.variantService.with(input.gameType, input.variant);

			this.logger.log(`Downloading server for instance "${input.name}"...`);
			const { serverArgs: providerArgs, executableOverride } = await provider.downloadServer(input.variantVersion, instanceDir, {
				runtimePath: runtime.executablePath,
			});

			// Use provider-specific args if returned, otherwise fall back to game type defaults
			const rawArgs = providerArgs ?? gameDetails.args;
			instance.serverArgs = this.resolveArgs(rawArgs, input);

			// If the provider specifies a custom executable (e.g., native game binaries), store it
			if (executableOverride) {
				instance.executableOverride = executableOverride;
			}

			// Generate config files from @kestrel/types definitions
			const configOverrides: Record<string, string> = {};
			if (input.port) {
				configOverrides['server-port='] = input.port.toString();
			}
			await this.generateConfigFiles(instanceDir, input.gameType, configOverrides);

			await this.instanceRepository.save(instance);
			this.logger.log(`Instance "${input.name}" created at ${instanceDir}`);
			return instance;
		} catch (error: any) {
			this.logger.error(`Failed to create instance: ${error.message}`);
			await remove(instanceDir);
			throw error;
		}
	}

	public async findAll(): Promise<Instance[]> {
		return this.instanceRepository.find();
	}

	public async findOne(id: string): Promise<Instance> {
		const instance = await this.instanceRepository.findOne({ where: { id } });
		if (!instance) {
			throw new Error(`Instance with id "${id}" not found`);
		}
		return instance;
	}

	public async deleteInstance(id: string): Promise<boolean> {
		const instance = await this.findOne(id);
		if (instance.status === InstanceStatus.RUNNING || instance.status === InstanceStatus.STARTING) {
			throw new Error('Cannot delete a running instance. Stop it first.');
		}

		this.validatePath(instance.instancePath);
		await remove(instance.instancePath);
		await this.instanceRepository.remove(instance);

		this.logger.log(`Instance "${instance.name}" deleted.`);
		return true;
	}

	public async updateStatus(id: string, status: InstanceStatus, pid: number | null = null): Promise<Instance> {
		const instance = await this.findOne(id);
		instance.status = status;
		instance.pid = pid;
		instance.updatedAt = new Date();
		return this.instanceRepository.save(instance);
	}
}
