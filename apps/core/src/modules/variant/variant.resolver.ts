import { GameType, GameVariant, type TGameVariant } from '@kestrel/types';
import { Query, Resolver, Args } from '@nestjs/graphql';
import { GameInfoDto } from './dto/game-info.dto';
import { VariantInfoDto } from './dto/variant-info.dto';
import { VariantService } from './variant.service';

@Resolver()
export class VariantResolver {
	constructor(private readonly variantService: VariantService) {}

	@Query(() => [GameInfoDto])
	public async getGames(): Promise<GameInfoDto[]> {
		const games: GameInfoDto[] = [];
		for (const game of Object.values(GameType)) {
			games.push(this.variantService.getGameInfo(game));
		}
		return games;
	}

	@Query(() => [VariantInfoDto])
	public async getVariants(@Args('for', { type: () => GameType }) game: GameType): Promise<VariantInfoDto[]> {
		const variants: VariantInfoDto[] = [];
		for (const variant of Object.values(GameVariant)) {
			const d = this.variantService.getVariantInfo(game, variant);
			if (d) {
				variants.push(d);
			}
		}
		return variants;
	}

	@Query(() => [String], { description: 'Get available server versions for a game variant' })
	public async getVariantVersions(
		@Args('gameType', { type: () => GameType }) gameType: GameType,
		@Args('variant', { type: () => GameVariant }) variant: TGameVariant,
	): Promise<string[]> {
		return this.variantService.with(gameType, variant).availableVersions();
	}
}
