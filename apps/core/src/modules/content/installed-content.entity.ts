import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../shared/base.entity';
import { Instance } from '../instance/instance.entity';
import { ContentType } from './models/content-type.enum';

@Entity()
@ObjectType()
export class InstalledContent extends Base<InstalledContent> {
	@ManyToOne(() => Instance, { onDelete: 'CASCADE' })
	public instance!: Instance;

	@Column({ type: 'text' })
	@Field()
	public instanceId!: string;

	@Column({ type: 'text' })
	@Field({ description: 'The mod provider this was installed from (e.g. modrinth)' })
	public provider!: string;

	@Column({ type: 'text' })
	@Field()
	public projectId!: string;

	@Column({ type: 'text' })
	@Field()
	public versionId!: string;

	@Column({ type: 'text' })
	@Field(() => ContentType)
	public contentType!: ContentType;

	@Column({ type: 'text' })
	@Field()
	public name!: string;

	@Column({ type: 'text', nullable: true })
	@Field({ nullable: true })
	public iconUrl?: string;

	@Column({ type: 'text' })
	@Field()
	public versionNumber!: string;

	@Column({ type: 'text' })
	@Field()
	public fileName!: string;

	@Column({ type: 'text' })
	@Field({ description: 'Relative path within the instance directory' })
	public filePath!: string;

	@Column({ type: 'text', nullable: true })
	@Field({ nullable: true })
	public fileHash?: string;
}
