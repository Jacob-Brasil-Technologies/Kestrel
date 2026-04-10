import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../user.entity';

@ObjectType({ description: 'Response when an admin creates a new user' })
export class CreateUserResponse {
	@Field(() => User)
	public user!: User;

	@Field({ description: 'The generated temporary password. Show this to the admin once — it cannot be retrieved again.' })
	public generatedPassword!: string;
}
