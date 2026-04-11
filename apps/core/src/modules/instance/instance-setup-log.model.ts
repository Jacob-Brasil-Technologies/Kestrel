import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InstanceSetupLog {
	@Field()
	correlationId!: string;

	@Field()
	message!: string;

	@Field()
	timestamp!: Date;
}

export const INSTANCE_SETUP_LOG_EVENT = 'instance.setup.log';
