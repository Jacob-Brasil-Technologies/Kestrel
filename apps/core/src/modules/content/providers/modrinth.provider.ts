import { TGameVariant } from '@kestrel/types';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { createWriteStream } from 'fs';
import { finished } from 'stream/promises';
import { ContentType } from '../models/content-type.enum';
import { ContentProject } from '../models/content-project.model';
import { ContentSearchHit, ContentSearchResponse } from '../models/content-search-result.model';
import { ContentVersion, ContentVersionDependency, ContentVersionFile } from '../models/content-version.model';
import { AbstractContentProvider, ContentSearchOptions } from './abstract-content-provider';

const BASE_URL = 'https://api.modrinth.com/v2';
const USER_AGENT = 'kestrel/1.0.0 (https://github.com/kestrel)';

/** Modrinth-specific mapping from Kestrel variant names to Modrinth loader categories */
const VARIANT_TO_LOADERS: Record<string, string[]> = {
	vanilla: [],
	paper: ['paper', 'spigot', 'bukkit', 'purpur'],
	fabric: ['fabric'],
	neoforge: ['neoforge'],
};

@Injectable()
export class ModrinthProvider extends AbstractContentProvider {
	readonly name = 'modrinth';

	private readonly client: AxiosInstance = axios.create({
		baseURL: BASE_URL,
		headers: { 'User-Agent': USER_AGENT },
	});

	getLoadersForVariant(variant: TGameVariant): string[] {
		return VARIANT_TO_LOADERS[variant] ?? [];
	}

	async search(options: ContentSearchOptions): Promise<ContentSearchResponse> {
		const facets: string[][] = [];

		if (options.projectType) {
			facets.push([`project_type:${options.projectType}`]);
		}

		if (options.loaders.length > 0) {
			// Items within the same array are OR'd (any of these loaders)
			facets.push(options.loaders.map((l) => `categories:${l}`));
		}

		if (options.gameVersion) {
			facets.push([`versions:${options.gameVersion}`]);
		}

		const params: Record<string, any> = {
			limit: options.limit ?? 20,
			offset: options.offset ?? 0,
		};

		if (options.query) {
			params.query = options.query;
		}

		if (facets.length > 0) {
			params.facets = JSON.stringify(facets);
		}

		const { data } = await this.client.get('/search', { params });

		return {
			hits: data.hits.map((h: any) => this.mapSearchHit(h)),
			offset: data.offset,
			limit: data.limit,
			totalHits: data.total_hits,
		};
	}

	async getProject(projectId: string): Promise<ContentProject> {
		const { data } = await this.client.get(`/project/${encodeURIComponent(projectId)}`);
		return this.mapProject(data);
	}

	async getVersions(projectId: string, gameVersion?: string, loaders?: string[]): Promise<ContentVersion[]> {
		const params: Record<string, any> = {};

		if (gameVersion) {
			params.game_versions = JSON.stringify([gameVersion]);
		}

		if (loaders && loaders.length > 0) {
			params.loaders = JSON.stringify(loaders);
		}

		const { data } = await this.client.get(`/project/${encodeURIComponent(projectId)}/version`, { params });
		return data.map((v: any) => this.mapVersion(v));
	}

	async getVersion(versionId: string): Promise<ContentVersion> {
		const { data } = await this.client.get(`/version/${encodeURIComponent(versionId)}`);
		return this.mapVersion(data);
	}

	async downloadFile(url: string, destPath: string): Promise<void> {
		const response = await this.client.get(url, { responseType: 'stream' });
		const writer = createWriteStream(destPath);
		response.data.pipe(writer);
		await finished(writer);
	}

	// --- Response mapping ---

	private mapSearchHit(h: any): ContentSearchHit {
		return {
			projectId: h.project_id,
			projectType: h.project_type as ContentType,
			slug: h.slug,
			title: h.title,
			description: h.description,
			categories: h.categories ?? [],
			gameVersions: h.versions ?? [],
			downloads: h.downloads ?? 0,
			follows: h.follows ?? 0,
			iconUrl: h.icon_url ?? undefined,
			dateModified: h.date_modified,
			latestVersion: h.latest_version ?? undefined,
			license: h.license ?? undefined,
			serverSide: h.server_side ?? 'unknown',
			clientSide: h.client_side ?? 'unknown',
		};
	}

	private mapProject(p: any): ContentProject {
		return {
			id: p.id,
			slug: p.slug,
			projectType: p.project_type as ContentType,
			title: p.title,
			description: p.description,
			body: p.body ?? '',
			categories: p.categories ?? [],
			gameVersions: p.game_versions ?? [],
			downloads: p.downloads ?? 0,
			follows: p.follows ?? 0,
			iconUrl: p.icon_url ?? undefined,
			serverSide: p.server_side ?? 'unknown',
			clientSide: p.client_side ?? 'unknown',
			gallery: p.gallery?.map((g: any) => (typeof g === 'string' ? g : g.url)) ?? [],
			license: p.license?.id ?? p.license ?? undefined,
			dateCreated: p.date_created,
			dateModified: p.date_modified,
		};
	}

	private mapVersion(v: any): ContentVersion {
		return {
			id: v.id,
			projectId: v.project_id,
			name: v.name,
			versionNumber: v.version_number,
			gameVersions: v.game_versions ?? [],
			loaders: v.loaders ?? [],
			versionType: v.version_type ?? 'release',
			downloads: v.downloads ?? 0,
			changelog: v.changelog ?? undefined,
			datePublished: v.date_published,
			files: (v.files ?? []).map((f: any) => this.mapFile(f)),
			dependencies: (v.dependencies ?? []).map((d: any) => this.mapDependency(d)),
		};
	}

	private mapFile(f: any): ContentVersionFile {
		return {
			url: f.url,
			filename: f.filename,
			primary: f.primary ?? false,
			size: f.size ?? 0,
			sha1: f.hashes?.sha1 ?? undefined,
			sha512: f.hashes?.sha512 ?? undefined,
		};
	}

	private mapDependency(d: any): ContentVersionDependency {
		return {
			projectId: d.project_id ?? undefined,
			versionId: d.version_id ?? undefined,
			dependencyType: d.dependency_type ?? 'required',
		};
	}
}
