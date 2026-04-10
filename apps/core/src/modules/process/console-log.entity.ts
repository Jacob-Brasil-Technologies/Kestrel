import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index } from 'typeorm';
import { Base } from '../../shared/base.entity';
import { ConsoleSource } from './console-line.model';

@Entity()
@ObjectType()
export class ConsoleLog extends Base<ConsoleLog> {
	@Column({ type: 'text' })
	@Field()
	@Index()
	public instanceId!: string;

	@Column({ type: 'text' })
	@Field()
	public line!: string;

	@Column({ type: 'simple-enum', enum: ConsoleSource })
	@Field(() => ConsoleSource)
	public source!: ConsoleSource;

	@Column({ type: 'integer' })
	@Index()
	public sessionStartedAt!: number;
}
