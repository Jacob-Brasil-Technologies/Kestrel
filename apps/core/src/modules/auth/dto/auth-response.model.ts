import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../user.entity';

@ObjectType()
export class AuthResponse {
	@Field({ description: 'JWT access token' })
	public token!: string;

	@Field(() => User)
	public user!: User;
}
