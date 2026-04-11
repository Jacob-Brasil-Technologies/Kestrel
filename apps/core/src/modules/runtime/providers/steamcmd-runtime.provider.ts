import { RuntimeType } from '@kestrel/types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import { ensureDir, remove } from 'fs-extra';
import { chmod, realpath } from 'fs/promises';
import { join } from 'path';
import { finished } from 'stream/promises';
import { x } from 'tar';
import { EntityManager, Repository } from 'typeorm';
import { Extract } from 'unzipper';
import { AvailableRuntimeDto } from '../dto/available-runtime.dto';
import { InstalledRuntimeDto } from '../dto/installed-runtime.dto';
import { Runtime } from '../runtime.entity';
import { AbstractRuntimeProvider } from './abstract-runtime.provider';

@Injectable()
export class SteamcmdRuntimeProvider extends AbstractRuntimeProvider {
	private readonly logger = new Logger('SteamcmdRuntimeProvider');

	constructor(
		@InjectRepository(Runtime)
		runtimeRepository: Repository<Runtime>,
		em: EntityManager,
	) {
		super(RuntimeType.Steamcmd, runtimeRepository, em);
	}

	public async installedRuntimeVersions(): Promise<InstalledRuntimeDto[]> {
		const execPath = await this.executablePath('latest');

		if (execPath) {
			return [{ version: 'latest', path: execPath }];
		}

		return [];
	}

	public async availableRuntimeVersions(): Promise<AvailableRuntimeDto[]> {
		// SteamCMD is versionless — it self-updates on first run
		return [{ version: 'latest', flags: [] }];
	}

	private getDownloadUrl(): string {
		switch (process.platform) {
			case 'linux':
				return 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz';
			case 'darwin':
				return 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz';
			case 'win32':
				return 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';
			default:
				throw new Error(`SteamCMD is not supported on platform: ${process.platform}`);
		}
	}

	private getExecutableName(): string {
		return process.platform === 'win32' ? 'steamcmd.exe' : 'steamcmd.sh';
	}

	protected async impl_Install(_version: string): Promise<boolean> {
		const runtimeRoot = await this.runtimeRootPath();
		const targetDir = join(runtimeRoot, 'latest');
		const downloadUrl = this.getDownloadUrl();
		const isZip = downloadUrl.endsWith('.zip');
		const tempFile = join(runtimeRoot, isZip ? 'steamcmd_temp.zip' : 'steamcmd_temp.tar.gz');

		try {
			this.logger.log('Downloading SteamCMD...');
			const response = await axios({ method: 'GET', url: downloadUrl, responseType: 'stream' });
			const writer = createWriteStream(tempFile);
			response.data.pipe(writer);
			await finished(writer);

			this.logger.log('Extracting SteamCMD...');
			await ensureDir(targetDir);

			if (isZip) {
				await createReadStream(tempFile)
					.pipe(Extract({ path: targetDir }))
					.promise();
			} else {
				await x({ file: tempFile, cwd: targetDir });
			}

			await remove(tempFile);

			// Ensure the executable has proper permissions on Unix
			if (process.platform !== 'win32') {
				const execPath = join(targetDir, this.getExecutableName());
				if (existsSync(execPath)) {
					await chmod(execPath, 0o755);
				}
			}

			this.logger.log('SteamCMD installed successfully.');
			return (await this.executablePath('latest')) !== undefined;
		} catch (error: any) {
			this.logger.error(`Failed to install SteamCMD: ${error.message}`);
			if (existsSync(tempFile)) await remove(tempFile);
			return false;
		}
	}

	protected async impl_Uninstall(_version: string): Promise<boolean> {
		const targetDir = join(await this.runtimeRootPath(), 'latest');

		if (!existsSync(targetDir)) {
			this.logger.warn('SteamCMD is not installed.');
			return false;
		}

		await remove(targetDir);
		this.logger.log('SteamCMD uninstalled successfully.');
		return true;
	}

	public async executablePath(_version: string): Promise<string | undefined> {
		const execPath = join(await this.runtimeRootPath(), 'latest', this.getExecutableName());

		if (existsSync(execPath)) {
			return await realpath(execPath);
		}

		return undefined;
	}
}
