import { ContentSearchResponse } from '../models/content-search-result.model';
import { ContentProject } from '../models/content-project.model';
import { ContentVersion } from '../models/content-version.model';
import { ContentType } from '../models/content-type.enum';

export interface ContentSearchOptions {
	query?: string;
	gameVersion: string;
	loaders: string[];
	projectType?: ContentType;
	limit?: number;
	offset?: number;
}

export abstract class AbstractContentProvider {
	abstract readonly name: string;

	/** Maps a Kestrel variant name to provider-specific loader identifiers */
	abstract getLoadersForVariant(variant: string): string[];

	abstract search(options: ContentSearchOptions): Promise<ContentSearchResponse>;
	abstract getProject(projectId: string): Promise<ContentProject>;
	abstract getVersions(projectId: string, gameVersion?: string, loaders?: string[]): Promise<ContentVersion[]>;
	abstract getVersion(versionId: string): Promise<ContentVersion>;
	abstract downloadFile(url: string, destPath: string): Promise<void>;
}
