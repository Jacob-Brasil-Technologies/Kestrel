import { RuntimeType } from '@kestrel/types';
import { ensureDir } from 'fs-extra';
import { join } from 'path';
import { EntityManager, Repository } from 'typeorm';
import { AvailableRuntimeDto } from '../dto/available-runtime.dto';
import { InstalledRuntimeDto } from '../dto/installed-runtime.dto';
import { Runtime } from '../runtime.entity';

export abstract class AbstractRuntimeProvider {
	protected constructor(
		protected readonly type: RuntimeType,
		private readonly runtimeRepository: Repository<Runtime>,
		private readonly em: EntityManager,
	) {}

	protected async runtimeRootPath(): Promise<string> {
		const path = join(process.cwd(), 'data', 'runtimes', this.type.toString());
		await ensureDir(path);
		return path;
	}

	public abstract installedRuntimeVersions(): Promise<InstalledRuntimeDto[]>;

	public abstract availableRuntimeVersions(): Promise<AvailableRuntimeDto[]>;

	public async install(version: string): Promise<boolean> {
		const success = await this.impl_Install(version);

		if (!success) {
			return false;
		}

		const path = await this.executablePath(version);
		if (!path) {
			return false;
		}

		const installed = this.runtimeRepository.create({
			type: this.type,
			version: version,
			executablePath: path,
		});

		await this.em.save(installed);
		return true;
	}

	protected abstract impl_Install(version: string): Promise<boolean>;

	public async uninstall(version: string): Promise<boolean> {
		const success = await this.impl_Uninstall(version);

		if (!success) {
			return false;
		}

		const existing = await this.runtimeRepository.findOne({
			where: {
				type: this.type,
				version,
			},
		});

		if (!existing) {
			return true;
		}

		await this.em.remove(existing);
		return true;
	}

	protected abstract impl_Uninstall(version: string): Promise<boolean>;

	public abstract executablePath(version: string): Promise<string | undefined>;

	public async ensureInstalled(version: string): Promise<Runtime> {
		const existing = await this.runtimeRepository.findOne({
			where: { type: this.type, version },
		});
		if (existing) return existing;

		const success = await this.install(version);
		if (!success) {
			throw new Error(`Failed to install ${this.type} runtime version ${version}`);
		}

		const installed = await this.runtimeRepository.findOne({
			where: { type: this.type, version },
		});
		if (!installed) {
			throw new Error(`${this.type} runtime version ${version} not found after installation`);
		}
		return installed;
	}
}
