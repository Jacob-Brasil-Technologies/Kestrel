import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChangePasswordInput {
	@Field()
	public currentPassword!: string;

	@Field()
	public newPassword!: string;
}
