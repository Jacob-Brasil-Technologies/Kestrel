import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { finished } from 'stream/promises';
import { AbstractVariantProvider, ServerDownloadResult } from '../abstract-variant.provider';

interface PaperProject {
	versions: string[];
}

interface PaperVersionBuilds {
	builds: Array<{
		build: number;
		downloads: {
			application: {
				name: string;
				sha256: string;
			};
		};
	}>;
}

@Injectable()
export class MinecraftPaperProvider extends AbstractVariantProvider {
	private readonly logger = new Logger('MinecraftPaperProvider');
	private readonly apiBase = 'https://api.papermc.io/v2/projects/paper';

	public async availableVersions(): Promise<string[]> {
		try {
			const res = await axios<PaperProject>({ method: 'GET', url: this.apiBase, responseType: 'json' });
			return [...res.data.versions].reverse();
		} catch (e: any) {
			this.logger.error(`Failed to fetch Paper versions: ${e.message}`);
			return [];
		}
	}

	public async downloadServer(version: string, targetDir: string): Promise<ServerDownloadResult> {
		const buildsUrl = `${this.apiBase}/versions/${version}/builds`;
		const buildsRes = await axios<PaperVersionBuilds>({ method: 'GET', url: buildsUrl, responseType: 'json' });

		const latestBuild = buildsRes.data.builds[buildsRes.data.builds.length - 1];
		if (!latestBuild) {
			throw new Error(`No builds available for Paper ${version}`);
		}

		const fileName = latestBuild.downloads.application.name;
		const downloadUrl = `${this.apiBase}/versions/${version}/builds/${latestBuild.build}/downloads/${fileName}`;

		const targetPath = join(targetDir, 'server.jar');
		this.logger.log(`Downloading Paper server ${version} (build ${latestBuild.build})...`);

		const response = await axios({ method: 'GET', url: downloadUrl, responseType: 'stream' });
		const writer = createWriteStream(targetPath);
		response.data.pipe(writer);
		await finished(writer);

		this.logger.log(`Paper server ${version} downloaded successfully.`);
		return {};
	}
}
