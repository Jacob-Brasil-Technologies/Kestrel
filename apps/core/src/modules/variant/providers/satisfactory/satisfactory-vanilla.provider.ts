import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { chmod } from 'fs/promises';
import { join } from 'path';
import { AbstractVariantProvider, ServerDownloadOptions, ServerDownloadResult } from '../abstract-variant.provider';

const SATISFACTORY_APP_ID = '1690800';

@Injectable()
export class SatisfactoryVanillaProvider extends AbstractVariantProvider {
	private readonly logger = new Logger('SatisfactoryVanillaProvider');

	public async availableVersions(): Promise<string[]> {
		// Satisfactory Dedicated Server doesn't expose versioned downloads —
		// SteamCMD always fetches the latest build.
		return ['latest'];
	}

	public async downloadServer(_version: string, targetDir: string, options?: ServerDownloadOptions): Promise<ServerDownloadResult> {
		if (!options?.runtimePath) {
			throw new Error('Satisfactory server download requires SteamCMD path');
		}

		if (process.platform === 'darwin') {
			throw new Error('Satisfactory Dedicated Server is only available on Linux and Windows');
		}

		const steamcmdPath = options.runtimePath;

		// Ensure SteamCMD is fully updated before installing (it restarts on first run and loses args)
		this.logger.log('Ensuring SteamCMD is up to date...');
		await this.runSteamCmd(steamcmdPath, ['+quit']);

		this.logger.log('Downloading Satisfactory Dedicated Server via SteamCMD (this may take a while)...');
		await this.runSteamCmd(steamcmdPath, [
			'+force_install_dir',
			targetDir,
			'+login',
			'anonymous',
			'+app_update',
			SATISFACTORY_APP_ID,
			'validate',
			'+quit',
		]);

		// Determine the server executable path
		const executablePath = this.getServerExecutable(targetDir);
		if (!executablePath) {
			throw new Error('Satisfactory server executable not found after download');
		}

		// Ensure executable permissions on Linux
		if (process.platform === 'linux') {
			await chmod(executablePath, 0o755);
		}

		this.logger.log('Satisfactory Dedicated Server downloaded successfully.');

		return {
			executableOverride: executablePath,
			// The binary requires 'FactoryGame' as its first positional argument
			serverArgs: ['FactoryGame', '-unattended', '-log'],
		};
	}

	private getServerExecutable(targetDir: string): string | null {
		if (process.platform === 'win32') {
			const winPath = join(targetDir, 'FactoryServer.exe');
			if (existsSync(winPath)) return winPath;
		} else {
			// Linux — prefer the actual binary over the .sh wrapper.
			// The .sh wrapper tries to chmod the binary internally, which
			// fails on Docker volumes that don't support Unix permissions.
			const binaryPath = join(targetDir, 'Engine', 'Binaries', 'Linux', 'FactoryServer-Linux-Shipping');
			if (existsSync(binaryPath)) return binaryPath;

			const linuxPath = join(targetDir, 'FactoryServer.sh');
			if (existsSync(linuxPath)) return linuxPath;
		}

		return null;
	}

	private runSteamCmd(steamcmdPath: string, args: string[]): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const proc = spawn(steamcmdPath, args, { stdio: 'pipe' });

			let output = '';
			proc.stdout?.on('data', (data) => {
				output += data.toString();
			});
			proc.stderr?.on('data', (data) => {
				output += data.toString();
			});

			proc.on('exit', (code) => {
				if (code === 0) {
					resolve();
				} else {
					this.logger.error(`SteamCMD output:\n${output}`);
					reject(new Error(`SteamCMD exited with code ${code}`));
				}
			});
			proc.on('error', reject);
		});
	}
}
