import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { remove } from 'fs-extra';
import { join } from 'path';
import { finished } from 'stream/promises';
import { AbstractVariantProvider, ServerDownloadOptions, ServerDownloadResult } from '../abstract-variant.provider';

interface NeoForgeVersionList {
	versions: string[];
}

@Injectable()
export class MinecraftNeoforgeProvider extends AbstractVariantProvider {
	private readonly logger = new Logger('MinecraftNeoforgeProvider');
	private readonly mavenApi = 'https://maven.neoforged.net';

	public async availableVersions(): Promise<string[]> {
		try {
			const res = await axios<NeoForgeVersionList>({
				method: 'GET',
				url: `${this.mavenApi}/api/maven/versions/releases/net/neoforged/neoforge`,
				responseType: 'json',
			});

			// NeoForge version X.Y.Z maps to MC 1.X.Y
			const mcVersions = new Map<string, boolean>();
			for (const v of res.data.versions) {
				const match = v.match(/^(\d+)\.(\d+)\./);
				if (match) {
					const mc = match[2] === '0' ? `1.${match[1]}` : `1.${match[1]}.${match[2]}`;
					mcVersions.set(mc, true);
				}
			}

			return [...mcVersions.keys()].reverse();
		} catch (e: any) {
			this.logger.error(`Failed to fetch NeoForge versions: ${e.message}`);
			return [];
		}
	}

	private async getLatestNeoForgeVersion(mcVersion: string): Promise<string> {
		// MC 1.21.4 → prefix "21.4.", MC 1.21 → prefix "21.0."
		const match = mcVersion.match(/^1\.(\d+)(?:\.(\d+))?$/);
		if (!match) {
			throw new Error(`Invalid Minecraft version format: ${mcVersion}`);
		}
		const prefix = `${match[1]}.${match[2] ?? '0'}.`;

		const res = await axios<NeoForgeVersionList>({
			method: 'GET',
			url: `${this.mavenApi}/api/maven/versions/releases/net/neoforged/neoforge`,
			responseType: 'json',
		});

		// Prefer stable (non-beta) builds, fall back to beta
		const stable = res.data.versions.filter((v) => v.startsWith(prefix) && !v.includes('beta'));
		if (stable.length > 0) {
			return stable[stable.length - 1];
		}

		const all = res.data.versions.filter((v) => v.startsWith(prefix));
		if (all.length === 0) {
			throw new Error(`No NeoForge versions found for Minecraft ${mcVersion}`);
		}
		return all[all.length - 1];
	}

	public async downloadServer(version: string, targetDir: string, options?: ServerDownloadOptions): Promise<ServerDownloadResult> {
		if (!options?.runtimePath) {
			throw new Error('NeoForge installation requires a Java executable path');
		}

		const neoForgeVersion = await this.getLatestNeoForgeVersion(version);
		const installerUrl = `${this.mavenApi}/releases/net/neoforged/neoforge/${neoForgeVersion}/neoforge-${neoForgeVersion}-installer.jar`;
		const installerPath = join(targetDir, 'installer.jar');

		this.logger.log(`Downloading NeoForge ${neoForgeVersion} installer...`);
		const response = await axios({ method: 'GET', url: installerUrl, responseType: 'stream' });
		const writer = createWriteStream(installerPath);
		response.data.pipe(writer);
		await finished(writer);

		this.logger.log(`Running NeoForge ${neoForgeVersion} installer (this may take a while)...`);
		await new Promise<void>((resolve, reject) => {
			const proc = spawn(options.runtimePath!, ['-jar', 'installer.jar', '--install-server'], {
				cwd: targetDir,
				stdio: 'pipe',
			});
			proc.on('exit', (code) => {
				if (code === 0) resolve();
				else reject(new Error(`NeoForge installer exited with code ${code}`));
			});
			proc.on('error', reject);
		});

		await remove(installerPath);

		const argsFileName = process.platform === 'win32' ? 'win_args.txt' : 'unix_args.txt';
		const argsFilePath = `libraries/net/neoforged/neoforge/${neoForgeVersion}/${argsFileName}`;

		this.logger.log(`NeoForge ${neoForgeVersion} installed successfully.`);
		return { serverArgs: [`@${argsFilePath}`, 'nogui'] };
	}
}
