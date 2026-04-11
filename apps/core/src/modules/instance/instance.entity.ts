import { GameType, GameVariant, type TGameVariant } from '@kestrel/types';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../shared/base.entity';
import { InstanceStatus } from '../../shared/enums';
import { Runtime } from '../runtime/runtime.entity';

@Entity()
@ObjectType()
export class Instance extends Base<Instance> {
	@Column({ type: 'text' })
	@Field()
	public name!: string;

	@Column({ type: 'simple-enum', enum: GameType })
	@Field(() => GameType)
	public gameType!: GameType;

	@Column({ type: 'simple-enum', enum: GameVariant })
	@Field(() => GameVariant, { description: 'The game variant / server software (e.g. vanilla, paper, fabric)' })
	public variant!: TGameVariant;

	@Column({ type: 'text' })
	@Field()
	public variantVersion!: string;

	@ManyToOne(() => Runtime, { eager: true, nullable: false })
	@Field(() => Runtime)
	public runtime!: Runtime;

	@Column({ type: 'text' })
	@Field()
	public instancePath!: string;

	@Column({ type: 'text', default: InstanceStatus.STOPPED })
	@Field(() => InstanceStatus)
	public status: InstanceStatus = InstanceStatus.STOPPED;

	@Column({ type: 'integer', nullable: true })
	public pid: number | null = null;

	@Column({ type: 'text', nullable: true })
	public executableOverride: string | null = null;

	@Column({ type: 'simple-json', nullable: true })
	public serverArgs: string[] = [];

	@Column({ type: 'integer', nullable: true })
	@Field(() => Int, { nullable: true })
	public port: number | null = null;

	@Column({ type: 'integer', nullable: true })
	@Field(() => Int, { nullable: true })
	public minMemory: number | null = null;

	@Column({ type: 'integer', nullable: true })
	@Field(() => Int, { nullable: true })
	public maxMemory: number | null = null;
}
