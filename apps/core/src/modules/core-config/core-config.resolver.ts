import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Public } from '../auth/decorators/public.decorator';
import { CoreConfig } from './core-config.entity';
import { CoreConfigService } from './core-config.service';
import { UpdateCoreInput } from './dto/update-core.input';

@Resolver(() => CoreConfig)
export class CoreConfigResolver {
	constructor(private readonly coreConfigService: CoreConfigService) {}

	@Public()
	@Query(() => CoreConfig, { nullable: true, description: 'Returns the current core configuration' })
	public async coreConfig(): Promise<CoreConfig | undefined> {
		return this.coreConfigService.getDefault();
	}

	@Mutation(() => CoreConfig, { description: 'Update the core configuration (name, icon, etc.)' })
	public async updateCore(@Args('input') input: UpdateCoreInput): Promise<CoreConfig> {
		return this.coreConfigService.updateDefault(input);
	}
}
