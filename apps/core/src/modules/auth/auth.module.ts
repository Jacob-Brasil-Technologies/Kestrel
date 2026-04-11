import { Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreConfigModule } from '../core-config/core-config.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { User } from './user.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET ?? 'kestrel-dev-secret-change-in-production',
			signOptions: { expiresIn: '7d' },
		}),
		forwardRef(() => CoreConfigModule),
	],
	providers: [
		AuthResolver,
		AuthService,
		{
			provide: APP_GUARD,
			useClass: GqlAuthGuard,
		},
	],
	exports: [AuthService],
})
export class AuthModule {}
