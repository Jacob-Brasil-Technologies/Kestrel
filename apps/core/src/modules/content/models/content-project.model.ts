import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ContentType } from './content-type.enum';

@ObjectType()
export class ContentProject {
	@Field()
	public id!: string;

	@Field()
	public slug!: string;

	@Field(() => ContentType)
	public projectType!: ContentType;

	@Field()
	public title!: string;

	@Field()
	public description!: string;

	@Field({ description: 'Full project description in markdown' })
	public body!: string;

	@Field(() => [String])
	public categories!: string[];

	@Field(() => [String])
	public gameVersions!: string[];

	@Field(() => Int)
	public downloads!: number;

	@Field(() => Int)
	public follows!: number;

	@Field({ nullable: true })
	public iconUrl?: string;

	@Field()
	public serverSide!: string;

	@Field()
	public clientSide!: string;

	@Field(() => [String])
	public gallery!: string[];

	@Field({ nullable: true })
	public license?: string;

	@Field()
	public dateCreated!: string;

	@Field()
	public dateModified!: string;
}
