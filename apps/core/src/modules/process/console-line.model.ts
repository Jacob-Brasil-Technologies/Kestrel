import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ConsoleSource {
	STDOUT = 'stdout',
	STDERR = 'stderr',
	SYSTEM = 'system',
}

registerEnumType(ConsoleSource, { name: 'ConsoleSource' });

@ObjectType()
export class ConsoleLine {
	@Field(() => ID)
	instanceId!: string;

	@Field()
	line!: string;

	@Field()
	timestamp!: Date;

	@Field(() => ConsoleSource)
	source!: ConsoleSource;
}
