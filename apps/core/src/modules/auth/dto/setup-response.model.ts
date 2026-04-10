import { Field, ObjectType } from '@nestjs/graphql';
import { CoreConfig } from '../../core-config/core-config.entity';

@ObjectType({ description: 'Response from verifying the setup code' })
export class SetupResponse {
	@Field(() => CoreConfig)
	public config!: CoreConfig;

	@Field({ description: 'Short-lived JWT for creating the initial admin account' })
	public setupToken!: string;
}
