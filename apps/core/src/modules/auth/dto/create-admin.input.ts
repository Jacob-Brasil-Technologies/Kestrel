import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAdminInput {
	@Field({ description: 'The setup token returned by setupCore' })
	public setupToken!: string;

	@Field()
	public username!: string;

	@Field()
	public password!: string;
}
