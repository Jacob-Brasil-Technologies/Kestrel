import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ContentService } from './content.service';
import { InstallContentInput } from './dto/install-content.input';
import { SearchContentInput } from './dto/search-content.input';
import { InstalledContent } from './installed-content.entity';
import { ContentProject } from './models/content-project.model';
import { ContentSearchResponse } from './models/content-search-result.model';
import { ContentVersion } from './models/content-version.model';

@Resolver()
export class ContentResolver {
	constructor(private readonly contentService: ContentService) {}

	@Query(() => ContentSearchResponse, { description: 'Search for content from mod providers, filtered by instance compatibility' })
	async searchContent(@Args('input') input: SearchContentInput): Promise<ContentSearchResponse> {
		return this.contentService.search(input);
	}

	@Query(() => ContentProject, { description: 'Get project details from a mod provider' })
	async contentProject(@Args('projectId') projectId: string): Promise<ContentProject> {
		return this.contentService.getProject(projectId);
	}

	@Query(() => [ContentVersion], { description: 'Get available versions for a project, filtered by instance compatibility' })
	async contentVersions(
		@Args('instanceId', { type: () => ID }) instanceId: string,
		@Args('projectId') projectId: string,
	): Promise<ContentVersion[]> {
		return this.contentService.getVersions(instanceId, projectId);
	}

	@Query(() => [InstalledContent], { description: 'List all installed content for an instance' })
	async installedContent(@Args('instanceId', { type: () => ID }) instanceId: string): Promise<InstalledContent[]> {
		return this.contentService.getInstalledContent(instanceId);
	}

	@Mutation(() => InstalledContent, { description: 'Install content from a mod provider into an instance' })
	async installContent(@Args('input') input: InstallContentInput): Promise<InstalledContent> {
		return this.contentService.install(input);
	}

	@Mutation(() => Boolean, { description: 'Uninstall content from an instance' })
	async uninstallContent(@Args('installedContentId', { type: () => ID }) installedContentId: string): Promise<boolean> {
		return this.contentService.uninstall(installedContentId);
	}
}
