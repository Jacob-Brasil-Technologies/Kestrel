import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { CoreConfigService } from '../core-config/core-config.service';
import { AuthResponse } from './dto/auth-response.model';
import { ChangePasswordInput } from './dto/change-password.input';
import { CreateAdminInput } from './dto/create-admin.input';
import { CreateUserInput } from './dto/create-user.input';
import { CreateUserResponse } from './dto/create-user-response.model';
import { LoginInput } from './dto/login.input';
import { SetupResponse } from './dto/setup-response.model';
import { UserRole } from './user-role.enum';
import { User } from './user.entity';

const SALT_ROUNDS = 12;
const SETUP_TOKEN_EXPIRY = '15m';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly jwtService: JwtService,
		private readonly coreConfigService: CoreConfigService,
	) {}

	/** Verify setup code and return a short-lived setup token for creating the admin account */
	async setupCore(code: string): Promise<SetupResponse> {
		const config = await this.coreConfigService.verifySetupCode(code);
		const setupToken = this.jwtService.sign({ purpose: 'setup' }, { expiresIn: SETUP_TOKEN_EXPIRY });
		return { config, setupToken };
	}

	/** Create the initial admin user using the setup token */
	async createAdmin(input: CreateAdminInput): Promise<AuthResponse> {
		// Validate setup token
		try {
			const payload = this.jwtService.verify(input.setupToken);
			if (payload.purpose !== 'setup') throw new Error();
		} catch {
			throw new UnauthorizedException('Invalid or expired setup token.');
		}

		// Ensure no users exist yet
		const userCount = await this.userRepository.count();
		if (userCount > 0) {
			throw new ForbiddenException('Admin account already exists.');
		}

		const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
		const user = this.userRepository.create({
			username: input.username,
			passwordHash,
			role: UserRole.ADMIN,
		});
		await this.userRepository.save(user);

		// Now that the admin exists, erase the setup code
		await this.coreConfigService.finalizeSetup();

		return { token: this.signToken(user), user };
	}

	/** Admin creates a new user with a generated temporary password */
	async createUser(input: CreateUserInput, caller: User): Promise<CreateUserResponse> {
		if (caller.role !== UserRole.ADMIN) {
			throw new ForbiddenException('Only admins can create users.');
		}

		const existing = await this.userRepository.findOne({ where: { username: input.username } });
		if (existing) {
			throw new BadRequestException('Username is already taken.');
		}

		const generatedPassword = this.generatePassword();
		const passwordHash = await bcrypt.hash(generatedPassword, SALT_ROUNDS);

		const user = this.userRepository.create({
			username: input.username,
			passwordHash,
			role: UserRole.USER,
			mustChangePassword: true,
		});
		await this.userRepository.save(user);

		return { user, generatedPassword };
	}

	async login(input: LoginInput): Promise<AuthResponse> {
		const user = await this.userRepository.findOne({ where: { username: input.username } });
		if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
			throw new UnauthorizedException('Invalid username or password.');
		}

		return { token: this.signToken(user), user };
	}

	async changePassword(input: ChangePasswordInput, caller: User): Promise<AuthResponse> {
		if (!(await bcrypt.compare(input.currentPassword, caller.passwordHash))) {
			throw new UnauthorizedException('Current password is incorrect.');
		}

		caller.passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
		caller.mustChangePassword = false;
		await this.userRepository.save(caller);

		return { token: this.signToken(caller), user: caller };
	}

	async validateUser(userId: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) throw new UnauthorizedException();
		return user;
	}

	async hasUsers(): Promise<boolean> {
		return (await this.userRepository.count()) > 0;
	}

	private signToken(user: User): string {
		return this.jwtService.sign({ sub: user.id, username: user.username, role: user.role });
	}

	private generatePassword(length = 16): string {
		const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
		const bytes = randomBytes(length);
		return Array.from(bytes, (b) => chars[b % chars.length]).join('');
	}
}
