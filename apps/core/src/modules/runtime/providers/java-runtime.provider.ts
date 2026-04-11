import { RuntimeType } from '@kestrel/types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import { ensureDir, move, remove } from 'fs-extra';
import { readdir, realpath } from 'fs/promises';
import { join } from 'path';
import { finished } from 'stream/promises';
import { x } from 'tar';
import { EntityManager, Repository } from 'typeorm';
import { Extract } from 'unzipper';
import { AvailableRuntimeDto, RuntimeFlag } from '../dto/available-runtime.dto';
import { InstalledRuntimeDto } from '../dto/installed-runtime.dto';
import { AbstractRuntimeProvider } from './abstract-runtime.provider';
import { Runtime } from '../runtime.entity';

@Injectable()
export class JavaRuntimeProvider extends AbstractRuntimeProvider {
	private readonly logger = new Logger('JavaRuntimeProvider');

	constructor(
		@InjectRepository(Runtime)
		runtimeRepository: Repository<Runtime>,
		em: EntityManager,
	) {
		super(RuntimeType.Java, runtimeRepository, em);
	}

	public async installedRuntimeVersions(): Promise<InstalledRuntimeDto[]> {
		let runtimeRootPath = await this.runtimeRootPath();

		let dirs = (await readdir(runtimeRootPath, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);

		let installedRuntimes: InstalledRuntimeDto[] = [];
		for (const dir of dirs) {
			const executablePath = await this.executablePath(dir);
			if (executablePath) {
				installedRuntimes.push({
					version: dir,
					path: executablePath,
				});
			} else {
				this.logger.warn(`Skipping directory ${join(runtimeRootPath, dir)} as it does not contain a valid executable.`);
			}
		}

		return installedRuntimes;
	}

	public async availableRuntimeVersions(): Promise<AvailableRuntimeDto[]> {
		const apiUrl = 'https://api.adoptium.net/v3/info/available_releases';

		try {
			const res = await axios<{
				available_lts_releases: number[];
				available_releases: number[];
				most_recent_feature_release: number;
				most_recent_feature_version: number;
				most_recent_lts: number;
				tip_version: number;
			}>({
				method: 'GET',
				url: apiUrl,
				responseType: 'json',
			});

			return res.data.available_releases.map((v): AvailableRuntimeDto => {
				let flags: RuntimeFlag[] = [];

				if (res.data.available_lts_releases.includes(v)) {
					flags.push(RuntimeFlag.LTS);
				}

				if (v === res.data.most_recent_lts) {
					flags.push(RuntimeFlag.RECOMMENDED);
				}

				return {
					version: v.toString(),
					flags,
				};
			});
		} catch (e: any) {
			this.logger.error(`Failed to fetch available Java versions from API: ${e.message}`);
			return [];
		}
	}

	protected async impl_Install(version: string): Promise<boolean> {
		const os = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'mac' : 'linux';
		const arch = process.arch === 'x64' ? 'x64' : 'aarch64';
		const extension = os === 'windows' ? 'zip' : 'tar.gz';

		const apiUrl = `https://api.adoptium.net/v3/binary/latest/${version}/ga/${os}/${arch}/jdk/hotspot/normal/eclipse`;

		const runtimeRoot = await this.runtimeRootPath();
		const tempFile = join(runtimeRoot, `temp_java_${version}.${extension}`);
		const tempExtractDir = join(runtimeRoot, `temp_extract_${version}`);
		const targetDir = join(runtimeRoot, version);

		try {
			const response = await axios({
				method: 'get',
				url: apiUrl,
				responseType: 'stream',
			});

			const writer = createWriteStream(tempFile);
			response.data.pipe(writer);
			await finished(writer);

			this.logger.log(`Extracting Java ${version}...`);
			await ensureDir(tempExtractDir);

			if (extension === 'zip') {
				await createReadStream(tempFile)
					.pipe(Extract({ path: tempExtractDir }))
					.promise();
			} else {
				await x({
					file: tempFile,
					cwd: tempExtractDir,
				});
			}
			await remove(tempFile);

			// The archive extracts with a top-level directory (e.g. jdk-25.0.2+10/).
			// On macOS, the JDK home is nested further under Contents/Home/.
			// We need to locate the actual JDK home and move it to the target directory.
			const extractedEntries = (await readdir(tempExtractDir, { withFileTypes: true })).filter((d) => d.isDirectory());
			if (extractedEntries.length !== 1) {
				throw new Error(`Unexpected archive structure: expected 1 top-level directory, found ${extractedEntries.length}`);
			}

			let jdkHome = join(tempExtractDir, extractedEntries[0].name);

			// On macOS, Adoptium JDKs have a Contents/Home structure
			const contentsHome = join(jdkHome, 'Contents', 'Home');
			if (existsSync(contentsHome)) {
				jdkHome = contentsHome;
			}

			// Move the JDK home to the final target directory
			await remove(targetDir);
			await move(jdkHome, targetDir);
			await remove(tempExtractDir);

			this.logger.log(`Java ${version} installed successfully.`);
			return (await this.executablePath(version)) !== undefined;
		} catch (error: any) {
			this.logger.error(`Failed to download Java: ${error.message}`);
			if (existsSync(tempFile)) {
				await remove(tempFile);
			}
			if (existsSync(tempExtractDir)) {
				await remove(tempExtractDir);
			}
			return false;
		}
	}

	protected async impl_Uninstall(version: string): Promise<boolean> {
		const directory = join(await this.runtimeRootPath(), version);

		if (!existsSync(directory)) {
			this.logger.warn(`Java version ${version} is not installed.`);
			return false;
		}

		await remove(directory);
		this.logger.log(`Java version ${version} uninstalled successfully.`);
		return true;
	}

	public async executablePath(version: string): Promise<string | undefined> {
		let executablePath = join(await this.runtimeRootPath(), version, 'bin');

		if (process.platform === 'win32') {
			executablePath = join(executablePath, 'java.exe');
		} else {
			executablePath = join(executablePath, 'java');
		}

		if (existsSync(executablePath)) {
			return await realpath(executablePath);
		} else {
			this.logger.warn(`Executable not found at path: ${executablePath}`);
			return;
		}
	}
}
