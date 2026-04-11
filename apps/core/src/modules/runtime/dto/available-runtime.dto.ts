import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class AvailableRuntimeDto {
	@Field()
	version!: string;

	@Field(() => [RuntimeFlag])
	flags!: RuntimeFlag[];
}

export enum RuntimeFlag {
	LTS = 'LTS',
	RECOMMENDED = 'RECOMMENDED',
}

registerEnumType(RuntimeFlag, {
	name: 'RuntimeFlag',
});
