import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
	ADMIN = 'admin',
	USER = 'user',
}

registerEnumType(UserRole, { name: 'UserRole' });
