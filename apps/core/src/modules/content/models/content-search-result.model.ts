import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ContentType } from './content-type.enum';

@ObjectType()
export class ContentSearchHit {
	@Field()
	public projectId!: string;

	@Field(() => ContentType)
	public projectType!: ContentType;

	@Field()
	public slug!: string;

	@Field()
	public title!: string;

	@Field()
	public description!: string;

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
	public dateModified!: string;

	@Field({ nullable: true })
	public latestVersion?: string;

	@Field({ nullable: true })
	public license?: string;

	@Field()
	public serverSide!: string;

	@Field()
	public clientSide!: string;
}

@ObjectType()
export class ContentSearchResponse {
	@Field(() => [ContentSearchHit])
	public hits!: ContentSearchHit[];

	@Field(() => Int)
	public offset!: number;

	@Field(() => Int)
	public limit!: number;

	@Field(() => Int)
	public totalHits!: number;
}
