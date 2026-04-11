import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ withoutRowid: true })
@ObjectType({ isAbstract: true })
export class Base<T extends { id: string }> extends BaseEntity {
	protected readonly __type!: T;

	@PrimaryColumn({ type: 'uuid' })
	@Field(() => ID)
	public id: string = crypto.randomUUID();

	@Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
	@Field()
	public createdAt: Date = new Date();

	@Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
	@Field()
	public updatedAt: Date = new Date();
}
