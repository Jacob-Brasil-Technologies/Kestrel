import { RuntimeType } from '@kestrel/types';
import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { Base } from '../../shared/base.entity';

@Entity()
@ObjectType()
export class Runtime extends Base<Runtime> {
	@Column({ type: 'text' })
	@Field(() => RuntimeType)
	public type!: RuntimeType;

	@Column({ type: 'text' })
	@Field()
	public version!: string;

	@Column({ type: 'text' })
	@Field()
	public executablePath!: string;
}
