import { Module } from '@nestjs/common';
import { FactorioVanillaProvider } from './providers/factorio/factorio-vanilla.provider';
import { MinecraftFabricProvider } from './providers/minecraft/minecraft-fabric.provider';
import { MinecraftNeoforgeProvider } from './providers/minecraft/minecraft-neoforge.provider';
import { MinecraftPaperProvider } from './providers/minecraft/minecraft-paper.provider';
import { MinecraftVanillaProvider } from './providers/minecraft/minecraft-vanilla.provider';
import { SatisfactoryVanillaProvider } from './providers/satisfactory/satisfactory-vanilla.provider';
import { VariantResolver } from './variant.resolver';
import { VariantService } from './variant.service';

@Module({
	imports: [],
	providers: [
		VariantResolver,
		VariantService,
		MinecraftVanillaProvider,
		MinecraftPaperProvider,
		MinecraftFabricProvider,
		MinecraftNeoforgeProvider,
		SatisfactoryVanillaProvider,
		FactorioVanillaProvider,
	],
	exports: [VariantService],
})
export class VariantModule {}
