import { GameType, GameVariant, getGameTypeDetails, getVariantDetails, TGameVariant } from '@kestrel/types';
import { Injectable } from '@nestjs/common';
import { GameInfoDto } from './dto/game-info.dto';
import { VariantInfoDto } from './dto/variant-info.dto';
import { AbstractVariantProvider } from './providers/abstract-variant.provider';
import { FactorioVanillaProvider } from './providers/factorio/factorio-vanilla.provider';
import { MinecraftFabricProvider } from './providers/minecraft/minecraft-fabric.provider';
import { MinecraftNeoforgeProvider } from './providers/minecraft/minecraft-neoforge.provider';
import { MinecraftPaperProvider } from './providers/minecraft/minecraft-paper.provider';
import { MinecraftVanillaProvider } from './providers/minecraft/minecraft-vanilla.provider';
import { SatisfactoryVanillaProvider } from './providers/satisfactory/satisfactory-vanilla.provider';

@Injectable()
export class VariantService {
	private readonly handlers: Map<GameType, Map<TGameVariant, AbstractVariantProvider>>;

	constructor(
		private readonly minecraftVanillaProvider: MinecraftVanillaProvider,
		private readonly minecraftPaperProvider: MinecraftPaperProvider,
		private readonly minecraftFabricProvider: MinecraftFabricProvider,
		private readonly minecraftNeoForgeProvider: MinecraftNeoforgeProvider,
		private readonly satisfactoryVanillaProvider: SatisfactoryVanillaProvider,
		private readonly factorioVanillaProvider: FactorioVanillaProvider,
	) {
		this.handlers = new Map([
			[
				GameType.Minecraft,
				new Map<TGameVariant, AbstractVariantProvider>([
					[GameVariant.Vanilla, this.minecraftVanillaProvider],
					[GameVariant.Paper, this.minecraftPaperProvider],
					[GameVariant.Fabric, this.minecraftFabricProvider],
					[GameVariant.NeoForge, this.minecraftNeoForgeProvider],
				]),
			],
			[
				GameType.Satisfactory,
				new Map<TGameVariant, AbstractVariantProvider>([
					[GameVariant.Vanilla, this.satisfactoryVanillaProvider],
				]),
			],
			[
				GameType.Factorio,
				new Map<TGameVariant, AbstractVariantProvider>([
					[GameVariant.Vanilla, this.factorioVanillaProvider],
				]),
			],
		]);
	}

	public with(game: GameType, variant: TGameVariant): AbstractVariantProvider {
		const handler = this.handlers.get(game)?.get(variant);
		if (!handler) {
			throw new Error(`No variant provider registered for game & variant: ${game}, ${variant}`);
		}
		return handler;
	}

	public getGameInfo(game: GameType): GameInfoDto {
		const gameDetails = getGameTypeDetails(game);

		const gameIconUrl = `/assets/game-icons/${gameDetails.icon}`;
		const devIconUrl = `/assets/developer-icons/${gameDetails.developerIcon}`;

		return {
			name: gameDetails.name,
			developer: gameDetails.developer,
			icon: gameIconUrl,
			developerIcon: devIconUrl,
			type: game,
			supportedPlatforms: gameDetails.supportedPlatforms,
		};
	}

	public getVariantInfo(game: GameType, variant: TGameVariant): VariantInfoDto | undefined {
		const variantDetails = getVariantDetails(game, variant);

		if (!variantDetails) {
			return;
		}

		let iconUrl = `/assets/variant-icons/${variantDetails.icon}`;
		if (variant == GameVariant.Vanilla) {
			const gameDetails = this.getGameInfo(game);
			iconUrl = gameDetails.icon;
		}

		return {
			name: variantDetails.name,
			description: variantDetails.desc,
			icon: iconUrl,
			variant: variant,
		};
	}
}
