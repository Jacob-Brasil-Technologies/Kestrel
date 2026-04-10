import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InstalledRuntimeDto {
	@Field()
	version!: string;

	@Field()
	path!: string;
}
