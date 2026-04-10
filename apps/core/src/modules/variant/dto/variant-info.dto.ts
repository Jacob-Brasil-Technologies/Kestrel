import { GameVariant, type TGameVariant } from '@kestrel/types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VariantInfoDto {
	@Field(() => String)
	public name!: string;

	@Field(() => String)
	public description!: string;

	@Field(() => String)
	public icon!: string;

	@Field(() => GameVariant)
	public variant!: TGameVariant;
}
