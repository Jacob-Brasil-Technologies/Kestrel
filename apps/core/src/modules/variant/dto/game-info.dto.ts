import { GameType, RuntimeType } from '@kestrel/types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserConfigEntryDto {
	@Field(() => String)
	public configType!: string;

	@Field(() => String)
	public default!: string;
}

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

	@Field(() => RuntimeType)
	public runtime!: RuntimeType;

	@Field(() => [String])
	public supportedPlatforms!: string[];

	@Field(() => [UserConfigEntryDto])
	public userConfig!: UserConfigEntryDto[];
}
