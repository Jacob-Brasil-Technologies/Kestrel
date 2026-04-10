import { RuntimeType } from '@kestrel/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AvailableRuntimeDto } from '../dto/available-runtime.dto';
import { InstalledRuntimeDto } from '../dto/installed-runtime.dto';
import { Runtime } from '../runtime.entity';
import { AbstractRuntimeProvider } from './abstract-runtime.provider';

/**
 * No-op runtime provider for games that ship as native binaries.
 * The actual executable is managed by the variant provider via `executableOverride`.
 */
@Injectable()
export class NativeRuntimeProvider extends AbstractRuntimeProvider {
	constructor(
		@InjectRepository(Runtime)
		runtimeRepository: Repository<Runtime>,
		em: EntityManager,
	) {
		super(RuntimeType.Native, runtimeRepository, em);
	}

	public async installedRuntimeVersions(): Promise<InstalledRuntimeDto[]> {
		return [{ version: 'native', path: 'native' }];
	}

	public async availableRuntimeVersions(): Promise<AvailableRuntimeDto[]> {
		return [{ version: 'native', flags: [] }];
	}

	protected async impl_Install(_version: string): Promise<boolean> {
		return true;
	}

	protected async impl_Uninstall(_version: string): Promise<boolean> {
		return true;
	}

	public async executablePath(_version: string): Promise<string | undefined> {
		// Native games use executableOverride from the variant provider
		return 'native';
	}
}
