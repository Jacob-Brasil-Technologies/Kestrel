import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
	@Field()
	public username!: string;

	@Field()
	public password!: string;
}
