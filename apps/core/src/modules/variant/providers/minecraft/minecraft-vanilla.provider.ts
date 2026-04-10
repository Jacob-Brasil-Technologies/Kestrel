import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { finished } from 'stream/promises';
import { AbstractVariantProvider, ServerDownloadResult } from '../abstract-variant.provider';

interface VersionManifest {
	latest: { release: string; snapshot: string };
	versions: Array<{
		id: string;
		type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha';
		url: string;
	}>;
}

interface VersionDetails {
	downloads: {
		server?: {
			sha1: string;
			size: number;
			url: string;
		};
	};
}

@Injectable()
export class MinecraftVanillaProvider extends AbstractVariantProvider {
	private readonly logger = new Logger('MinecraftVanillaProvider');
	private readonly manifestUrl = 'https://launchermeta.mojang.com/mc/game/version_manifest_v2.json';

	public async availableVersions(): Promise<string[]> {
		try {
			const res = await axios<VersionManifest>({ method: 'GET', url: this.manifestUrl, responseType: 'json' });
			return res.data.versions.filter((v) => v.type === 'release').map((v) => v.id);
		} catch (e: any) {
			this.logger.error(`Failed to fetch Vanilla versions: ${e.message}`);
			return [];
		}
	}

	public async downloadServer(version: string, targetDir: string): Promise<ServerDownloadResult> {
		const manifest = await axios<VersionManifest>({ method: 'GET', url: this.manifestUrl, responseType: 'json' });
		const versionEntry = manifest.data.versions.find((v) => v.id === version);
		if (!versionEntry) {
			throw new Error(`Vanilla version ${version} not found`);
		}

		const versionDetails = await axios<VersionDetails>({ method: 'GET', url: versionEntry.url, responseType: 'json' });
		const serverDownload = versionDetails.data.downloads.server;
		if (!serverDownload) {
			throw new Error(`No server download available for Vanilla ${version}`);
		}

		const targetPath = join(targetDir, 'server.jar');
		this.logger.log(`Downloading Vanilla server ${version}...`);

		const response = await axios({ method: 'GET', url: serverDownload.url, responseType: 'stream' });
		const writer = createWriteStream(targetPath);
		response.data.pipe(writer);
		await finished(writer);

		this.logger.log(`Vanilla server ${version} downloaded successfully.`);
		return {};
	}
}
