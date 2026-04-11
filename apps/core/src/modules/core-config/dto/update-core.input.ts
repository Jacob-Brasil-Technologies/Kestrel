import { Field, InputType } from '@nestjs/graphql';
import { GraphQLUpload, type FileUpload } from 'graphql-upload-ts';

@InputType()
export class UpdateCoreInput {
	@Field(() => String, { nullable: true })
	public name?: string;

	@Field(() => GraphQLUpload, { nullable: true, description: 'Icon image file upload' })
	public icon?: Promise<FileUpload>;
}
