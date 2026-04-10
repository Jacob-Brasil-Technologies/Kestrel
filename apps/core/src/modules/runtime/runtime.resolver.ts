import { RuntimeType } from '@kestrel/types';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AvailableRuntimeDto } from './dto/available-runtime.dto';
import { InstalledRuntimeDto } from './dto/installed-runtime.dto';
import { RuntimeService } from './runtime.service';

@Resolver()
export class RuntimeResolver {
	constructor(private readonly runtimeService: RuntimeService) {}

	@Query(() => [InstalledRuntimeDto])
	public async installedRuntimes(
		@Args({
			name: 'type',
			type: () => RuntimeType,
		})
		type: RuntimeType,
	): Promise<InstalledRuntimeDto[]> {
		return this.runtimeService.with(type).installedRuntimeVersions();
	}

	@Query(() => [AvailableRuntimeDto])
	public async availableRuntimes(
		@Args({
			name: 'type',
			type: () => RuntimeType,
		})
		type: RuntimeType,
	): Promise<AvailableRuntimeDto[]> {
		return this.runtimeService.with(type).availableRuntimeVersions();
	}

	@Mutation(() => Boolean)
	public async installRuntime(
		@Args({
			name: 'type',
			type: () => RuntimeType,
		})
		type: RuntimeType,
		@Args('version') version: string,
	): Promise<boolean> {
		return this.runtimeService.with(type).install(version);
	}

	@Mutation(() => Boolean)
	public async uninstallRuntime(
		@Args({
			name: 'type',
			type: () => RuntimeType,
		})
		type: RuntimeType,
		@Args('version') version: string,
	): Promise<boolean> {
		return this.runtimeService.with(type).uninstall(version);
	}
}
