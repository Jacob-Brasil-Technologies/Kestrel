import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateInstanceInput {
	@Field({ nullable: true })
	name?: string;

	@Field(() => Int, { nullable: true })
	minMemory?: number;

	@Field(() => Int, { nullable: true })
	maxMemory?: number;

	@Field(() => Int, { nullable: true })
	port?: number;
}
