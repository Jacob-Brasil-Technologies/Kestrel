import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class InstallContentInput {
	@Field({ description: 'The instance to install content into' })
	public instanceId!: string;

	@Field({ description: 'The mod provider project ID' })
	public projectId!: string;

	@Field({ description: 'The specific version ID to install' })
	public versionId!: string;
}
