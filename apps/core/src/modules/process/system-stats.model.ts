import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SystemStats {
	@Field(() => Int)
	totalInstances!: number;

	@Field(() => Int)
	runningInstances!: number;

	@Field()
	platform!: string;

	@Field()
	arch!: string;

	@Field(() => Float)
	totalMemoryGB!: number;

	@Field(() => Float)
	freeMemoryGB!: number;

	@Field(() => Int)
	cpuCount!: number;
}
