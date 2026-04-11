import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthResponse } from './dto/auth-response.model';
import { ChangePasswordInput } from './dto/change-password.input';
import { CreateAdminInput } from './dto/create-admin.input';
import { CreateUserInput } from './dto/create-user.input';
import { CreateUserResponse } from './dto/create-user-response.model';
import { LoginInput } from './dto/login.input';
import { SetupResponse } from './dto/setup-response.model';
import { User } from './user.entity';

@Resolver(() => User)
export class AuthResolver {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Mutation(() => SetupResponse, { description: 'Verify the setup code and receive a short-lived token for creating the admin account' })
	async setupCore(@Args('code') code: string): Promise<SetupResponse> {
		return this.authService.setupCore(code);
	}

	@Public()
	@Mutation(() => AuthResponse, { description: 'Create the initial admin account using the setup token' })
	async createAdmin(@Args('input') input: CreateAdminInput): Promise<AuthResponse> {
		return this.authService.createAdmin(input);
	}

	@Mutation(() => CreateUserResponse, { description: 'Admin creates a new user with a generated temporary password' })
	async createUser(@Args('input') input: CreateUserInput, @CurrentUser() caller: User): Promise<CreateUserResponse> {
		return this.authService.createUser(input, caller);
	}

	@Public()
	@Mutation(() => AuthResponse, { description: 'Log in with username and password to receive a JWT' })
	async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
		return this.authService.login(input);
	}

	@Mutation(() => AuthResponse, { description: 'Change your password. Clears the mustChangePassword flag.' })
	async changePassword(@Args('input') input: ChangePasswordInput, @CurrentUser() caller: User): Promise<AuthResponse> {
		return this.authService.changePassword(input, caller);
	}

	@Query(() => User, { description: 'Returns the currently authenticated user' })
	async me(@CurrentUser() user: User): Promise<User> {
		return user;
	}

	@Public()
	@Query(() => Boolean, { description: 'Whether any users have been created yet' })
	async hasUsers(): Promise<boolean> {
		return this.authService.hasUsers();
	}
}
