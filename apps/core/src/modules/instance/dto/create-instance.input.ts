import { GameType, GameVariant, type TGameVariant } from '@kestrel/types';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateInstanceInput {
	@Field()
	name!: string;

	@Field(() => GameType)
	gameType!: GameType;

	@Field(() => GameVariant, { description: 'The game variant / server software to use' })
	variant!: TGameVariant;

	@Field()
	variantVersion!: string;

	@Field({ description: 'Version of the runtime required by the game (e.g. "21" for Java)' })
	runtimeVersion!: string;

	@Field(() => Int, { nullable: true, defaultValue: 1024 })
	minMemory?: number;

	@Field(() => Int, { nullable: true, defaultValue: 2048 })
	maxMemory?: number;

	@Field(() => Int, { nullable: true, description: 'Server port; if omitted the game default is used' })
	port?: number;
}
