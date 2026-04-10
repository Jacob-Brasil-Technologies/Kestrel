import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { finished } from 'stream/promises';
import { AbstractVariantProvider, ServerDownloadResult } from '../abstract-variant.provider';

interface FabricGameVersion {
	version: string;
	stable: boolean;
}

interface FabricLoaderVersion {
	version: string;
	stable: boolean;
}

interface FabricInstallerVersion {
	version: string;
	stable: boolean;
}

@Injectable()
export class MinecraftFabricProvider extends AbstractVariantProvider {
	private readonly logger = new Logger('MinecraftFabricProvider');
	private readonly metaBase = 'https://meta.fabricmc.net/v2';

	public async availableVersions(): Promise<string[]> {
		try {
			const res = await axios<FabricGameVersion[]>({ method: 'GET', url: `${this.metaBase}/versions/game`, responseType: 'json' });
			return res.data.filter((v) => v.stable).map((v) => v.version);
		} catch (e: any) {
			this.logger.error(`Failed to fetch Fabric game versions: ${e.message}`);
			return [];
		}
	}

	public async downloadServer(version: string, targetDir: string): Promise<ServerDownloadResult> {
		const [loaderVersions, installerVersions] = await Promise.all([
			axios<FabricLoaderVersion[]>({ method: 'GET', url: `${this.metaBase}/versions/loader`, responseType: 'json' }),
			axios<FabricInstallerVersion[]>({ method: 'GET', url: `${this.metaBase}/versions/installer`, responseType: 'json' }),
		]);

		const latestLoader = loaderVersions.data.find((v) => v.stable);
		const latestInstaller = installerVersions.data.find((v) => v.stable);

		if (!latestLoader || !latestInstaller) {
			throw new Error('Could not determine latest stable Fabric loader or installer version');
		}

		const downloadUrl = `${this.metaBase}/versions/loader/${version}/${latestLoader.version}/${latestInstaller.version}/server/jar`;
		const targetPath = join(targetDir, 'server.jar');

		this.logger.log(`Downloading Fabric server for MC ${version} (loader ${latestLoader.version})...`);

		const response = await axios({ method: 'GET', url: downloadUrl, responseType: 'stream' });
		const writer = createWriteStream(targetPath);
		response.data.pipe(writer);
		await finished(writer);

		this.logger.log(`Fabric server for MC ${version} downloaded successfully.`);
		return {};
	}
}
