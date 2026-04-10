import { Field, InputType, Int } from '@nestjs/graphql';
import { ContentType } from '../models/content-type.enum';

@InputType()
export class SearchContentInput {
	@Field({ description: 'The instance to search content for (determines game version and loader filtering)' })
	public instanceId!: string;

	@Field({ nullable: true, description: 'Search query' })
	public query?: string;

	@Field(() => ContentType, { nullable: true, defaultValue: ContentType.MOD, description: 'Filter by content type' })
	public contentType?: ContentType;

	@Field(() => Int, { nullable: true, defaultValue: 20 })
	public limit?: number;

	@Field(() => Int, { nullable: true, defaultValue: 0 })
	public offset?: number;
}
