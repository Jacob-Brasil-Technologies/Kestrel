import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { Base } from '../../shared/base.entity';
import { UserRole } from './user-role.enum';

@Entity()
@ObjectType()
export class User extends Base<User> {
	@Column({ type: 'text', unique: true })
	@Field()
	public username!: string;

	@Column({ type: 'text' })
	@HideField()
	public passwordHash!: string;

	@Column({ type: 'text', default: UserRole.USER })
	@Field(() => UserRole)
	public role!: UserRole;

	@Column({ type: 'boolean', default: false })
	@Field(() => Boolean, { description: 'Whether the user must change their password on next login' })
	public mustChangePassword: boolean = false;
}
