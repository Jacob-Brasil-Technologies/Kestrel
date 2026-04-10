import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ContentVersionFile {
	@Field()
	public url!: string;

	@Field()
	public filename!: string;

	@Field()
	public primary!: boolean;

	@Field(() => Int)
	public size!: number;

	@Field({ nullable: true })
	public sha1?: string;

	@Field({ nullable: true })
	public sha512?: string;
}

@ObjectType()
export class ContentVersionDependency {
	@Field({ nullable: true })
	public projectId?: string;

	@Field({ nullable: true })
	public versionId?: string;

	@Field({ description: 'required, optional, incompatible, or embedded' })
	public dependencyType!: string;
}

@ObjectType()
export class ContentVersion {
	@Field()
	public id!: string;

	@Field()
	public projectId!: string;

	@Field()
	public name!: string;

	@Field()
	public versionNumber!: string;

	@Field(() => [String])
	public gameVersions!: string[];

	@Field(() => [String])
	public loaders!: string[];

	@Field({ description: 'release, beta, or alpha' })
	public versionType!: string;

	@Field(() => Int)
	public downloads!: number;

	@Field({ nullable: true })
	public changelog?: string;

	@Field()
	public datePublished!: string;

	@Field(() => [ContentVersionFile])
	public files!: ContentVersionFile[];

	@Field(() => [ContentVersionDependency])
	public dependencies!: ContentVersionDependency[];
}
