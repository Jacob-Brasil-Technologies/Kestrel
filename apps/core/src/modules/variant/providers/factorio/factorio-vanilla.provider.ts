import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { createWriteStream, existsSync } from 'fs';
import { chmod, mkdir } from 'fs/promises';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { AbstractVariantProvider, ServerDownloadOptions, ServerDownloadResult } from '../abstract-variant.provider';

const FACTORIO_API_URL = 'https://factorio.com/api/latest-releases';
const FACTORIO_DOWNLOAD_URL = 'https://factorio.com/get-download';

const DEFAULT_SERVER_SETTINGS = {
	name: 'Factorio Server',
	description: 'A Kestrel-managed Factorio server',
	tags: ['game'],
	max_players: 0,
	visibility: { public: false, lan: true },
	username: '',
	password: '',
	token: '',
	game_password: '',
	require_user_verification: false,
	max_upload_in_kilobytes_per_second: 0,
	max_upload_slots: 5,
	minimum_latency_in_ticks: 0,
	max_heartbeats_per_second: 60,
	ignore_player_limit_for_returning_players: false,
	allow_commands: 'admins-only',
	autosave_interval: 10,
	autosave_slots: 5,
	afk_autokick_interval: 0,
	auto_pause: true,
	only_admins_can_pause_the_game: true,
	autosave_only_on_server: true,
};

@Injectable()
export class FactorioVanillaProvider extends AbstractVariantProvider {
	private readonly logger = new Logger('FactorioVanillaProvider');

	public async availableVersions(): Promise<string[]> {
		try {
			const res = await fetch(FACTORIO_API_URL);
			const data = (await res.json()) as {
				stable: { headless: string };
				experimental: { headless: string };
			};

			const versions: string[] = [];
			if (data.stable?.headless) versions.push(data.stable.headless);
			if (data.experimental?.headless && data.experimental.headless !== data.stable?.headless) {
				versions.push(data.experimental.headless);
			}
			return versions;
		} catch (err) {
			this.logger.warn('Failed to fetch Factorio versions, falling back to "stable"');
			return ['stable'];
		}
	}

	public async downloadServer(version: string, targetDir: string, _options?: ServerDownloadOptions): Promise<ServerDownloadResult> {
		const downloadUrl = `${FACTORIO_DOWNLOAD_URL}/${version}/headless/linux64`;
		const archivePath = join(targetDir, 'factorio-headless.tar.xz');

		this.logger.log(`Downloading Factorio headless server ${version}...`);

		// Download the archive
		const res = await fetch(downloadUrl, { redirect: 'follow' });
		if (!res.ok || !res.body) {
			throw new Error(`Failed to download Factorio server: ${res.status} ${res.statusText}`);
		}

		const fileStream = createWriteStream(archivePath);
		await pipeline(res.body as any, fileStream);

		// Extract the tar.xz archive
		this.logger.log('Extracting Factorio server...');
		await new Promise<void>((resolve, reject) => {
			const proc = spawn('tar', ['-xJf', archivePath, '-C', targetDir], { stdio: 'pipe' });
			proc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`tar exited with code ${code}`))));
			proc.on('error', reject);
		});

		// The archive extracts to a factorio/ subdirectory
		const factorioDir = join(targetDir, 'factorio');
		const executablePath = join(factorioDir, 'bin', 'x64', 'factorio');

		if (!existsSync(executablePath)) {
			throw new Error('Factorio executable not found after extraction');
		}

		await chmod(executablePath, 0o755);

		// Create saves directory and initial save
		const savesDir = join(factorioDir, 'saves');
		await mkdir(savesDir, { recursive: true });

		this.logger.log('Creating initial Factorio save...');
		await new Promise<void>((resolve, reject) => {
			const proc = spawn(executablePath, ['--create', join(savesDir, 'save.zip')], {
				cwd: factorioDir,
				stdio: 'pipe',
			});
			proc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Failed to create initial save: exit code ${code}`))));
			proc.on('error', reject);
		});

		// Write default server settings
		const { writeFile } = await import('fs/promises');
		await writeFile(join(factorioDir, 'server-settings.json'), JSON.stringify(DEFAULT_SERVER_SETTINGS, null, 2));

		// Clean up the archive
		const { unlink } = await import('fs/promises');
		await unlink(archivePath).catch(() => {});

		this.logger.log('Factorio headless server downloaded and configured.');

		return {
			executableOverride: executablePath,
			serverArgs: ['--start-server-load-latest', '--server-settings', join(factorioDir, 'server-settings.json')],
		};
	}
}
