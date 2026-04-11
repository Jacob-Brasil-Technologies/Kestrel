import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameType, getConfigurableArgs, getConfigurations, getGameTypeDetails, TGameVariant } from '@kestrel/types';
import { ensureDir, remove, writeFile } from 'fs-extra';
import { join, resolve } from 'path';
import { Repository } from 'typeorm';
import { RuntimeService } from '../runtime/runtime.service';
import { VariantService } from '../variant/variant.service';
import { CreateInstanceInput } from './dto/create-instance.input';
import { UpdateInstanceInput } from './dto/update-instance.input';
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

	/** Resolve template placeholders (e.g. {MAX_MEMORY}, {PORT}) in arg strings using instance settings */
	public resolveArgs(args: string[], instance: Instance): string[] {
		return args.map((arg) =>
			arg
				.replace('{MAX_MEMORY}', `${instance.maxMemory ?? 2048}M`)
				.replace('{MIN_MEMORY}', `${instance.minMemory ?? 1024}M`)
				.replace('{PORT}', `${instance.port ?? 25565}`),
		);
	}

	/** Generate config files (eula.txt, server.properties, etc.) from @kestrel/types definitions */
	private async generateConfigFiles(instanceDir: string, gameType: GameType, instance: Instance): Promise<void> {
		const configs = getConfigurations(gameType);
		for (const config of configs) {
			const lines = config.lines
				.filter((line) => line.default !== undefined)
				.map((line) => {
					// If this config line has a userConfig link (e.g., port), use the instance value
					if (line.config?.configType === 'port' && instance.port != null) {
						return `${line.linePrefix}${instance.port}`;
					}
					return `${line.linePrefix}${line.default!}`;
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

		// Resolve default settings from userConfig
		const portDefault = gameDetails.userConfig.find((c) => c.configType === 'port');

		const instance = this.instanceRepository.create({
			name: input.name,
			gameType: input.gameType,
			variant: input.variant,
			variantVersion: input.variantVersion,
			runtime,
			status: InstanceStatus.STOPPED,
			minMemory: input.minMemory ?? null,
			maxMemory: input.maxMemory ?? null,
			port: input.port ?? (portDefault ? parseInt(portDefault.default) : null),
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

			// Store arg templates (with placeholders like {MAX_MEMORY})
			let templateArgs: string[];
			if (providerArgs) {
				templateArgs = [...providerArgs];
				// Merge any configurable game type args the provider didn't include
				const configurableArgs = getConfigurableArgs(input.gameType);
				for (const configArg of configurableArgs) {
					if (!templateArgs.some((a) => a === configArg)) {
						templateArgs.push(configArg);
					}
				}
			} else {
				templateArgs = gameDetails.args;
			}
			instance.serverArgs = templateArgs;

			// If the provider specifies a custom executable (e.g., native game binaries), store it
			if (executableOverride) {
				instance.executableOverride = executableOverride;
			}

			// Generate config files using instance settings
			await this.generateConfigFiles(instanceDir, input.gameType, instance);

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

	public async updateInstance(id: string, input: UpdateInstanceInput): Promise<Instance> {
		const instance = await this.findOne(id);
		if (instance.status === InstanceStatus.RUNNING || instance.status === InstanceStatus.STARTING) {
			throw new Error('Cannot update a running instance. Stop it first.');
		}

		if (input.name != null) instance.name = input.name;
		if (input.minMemory != null) instance.minMemory = input.minMemory;
		if (input.maxMemory != null) instance.maxMemory = input.maxMemory;
		if (input.port != null) instance.port = input.port;

		// Regenerate config files if port changed
		if (input.port != null) {
			this.validatePath(instance.instancePath);
			await this.generateConfigFiles(instance.instancePath, instance.gameType, instance);
		}

		instance.updatedAt = new Date();
		return this.instanceRepository.save(instance);
	}

	public async updateStatus(id: string, status: InstanceStatus, pid: number | null = null): Promise<Instance> {
		const instance = await this.findOne(id);
		instance.status = status;
		instance.pid = pid;
		instance.updatedAt = new Date();
		return this.instanceRepository.save(instance);
	}
}
