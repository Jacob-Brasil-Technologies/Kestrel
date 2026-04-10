import { GameType } from '@kestrel/types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GameInfoDto {
	@Field(() => String)
	public name!: string;

	@Field(() => String)
	public developer!: string;

	@Field(() => String)
	icon!: string;

	@Field(() => String)
	developerIcon!: string;

	@Field(() => GameType)
	public type!: GameType;

	@Field(() => [String])
	public supportedPlatforms!: string[];
}
