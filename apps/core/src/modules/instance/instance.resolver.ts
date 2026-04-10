import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GameInfoDto } from '../variant/dto/game-info.dto';
import { VariantInfoDto } from '../variant/dto/variant-info.dto';
import { VariantService } from '../variant/variant.service';
import { CreateInstanceInput } from './dto/create-instance.input';
import { Instance } from './instance.entity';
import { InstanceService } from './instance.service';

@Resolver(() => Instance)
export class InstanceResolver {
	constructor(
		private readonly instanceService: InstanceService,
		private readonly variantService: VariantService,
	) {}

	@Query(() => [Instance])
	public async instances(): Promise<Instance[]> {
		return this.instanceService.findAll();
	}

	@Query(() => Instance)
	public async instance(@Args('id', { type: () => ID }) id: string): Promise<Instance> {
		return this.instanceService.findOne(id);
	}

	@Mutation(() => Instance)
	public async createInstance(@Args('input') input: CreateInstanceInput): Promise<Instance> {
		return this.instanceService.createInstance(input);
	}

	@Mutation(() => Boolean)
	public async deleteInstance(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
		return this.instanceService.deleteInstance(id);
	}

	@ResolveField(() => GameInfoDto)
	public gameInfo(@Parent() instance: Instance): GameInfoDto {
		return this.variantService.getGameInfo(instance.gameType);
	}

	@ResolveField(() => VariantInfoDto)
	public variantInfo(@Parent() instance: Instance): VariantInfoDto {
		return this.variantService.getVariantInfo(instance.gameType, instance.variant)!;
	}
}
