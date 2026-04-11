import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { Base } from '../../shared/base.entity';

@Entity()
@ObjectType()
export class CoreConfig extends Base<CoreConfig> {
	@Column({ type: 'text' })
	@Field(() => String)
	public name!: string;

	@Column({ type: 'text', nullable: true })
	@Field(() => String, { nullable: true })
	public icon?: string;

	@Column({ type: 'text', nullable: true })
	@HideField()
	public setupCode?: string | null;

	@Column({ type: 'boolean', default: false })
	@Field(() => Boolean)
	public isSetup!: boolean;
}
