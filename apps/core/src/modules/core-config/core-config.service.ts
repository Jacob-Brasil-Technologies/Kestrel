import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createWriteStream } from 'fs';
import { ensureDir } from 'fs-extra';
import { join } from 'path';
import { finished } from 'stream/promises';
import { Repository } from 'typeorm';
import { CoreConfig } from './core-config.entity';
import { UpdateCoreInput } from './dto/update-core.input';

@Injectable()
export class CoreConfigService {
	private readonly logger = new Logger('CoreConfigService');

	constructor(
		@InjectRepository(CoreConfig)
		private readonly coreConfigRepository: Repository<CoreConfig>,
	) {}

	private get uploadsDir(): string {
		return join(process.cwd(), 'data', 'uploads');
	}

	public async createDefault(): Promise<CoreConfig> {
		const existing = (await this.coreConfigRepository.find()).at(0);

		if (existing) {
			return existing;
		}

		const setupCode = Math.floor(Math.random() * 0xffffffff)
			.toString(16)
			.padStart(8, '0');

		const config = await this.coreConfigRepository
			.create({
				name: 'My Kestrel Core',
				setupCode,
			})
			.save();

		this.logger.log(`\n${'='.repeat(50)}`);
		this.logger.log(`  Setup Code: ${setupCode}`);
		this.logger.log(`  Use this code to pair your dashboard.`);
		this.logger.log(`${'='.repeat(50)}\n`);

		return config;
	}

	public async getDefault(): Promise<CoreConfig | undefined> {
		return (await this.coreConfigRepository.find()).at(0);
	}

	/** Verify setup code without erasing it. */
	public async verifySetupCode(code: string): Promise<CoreConfig> {
		const existing = await this.coreConfigRepository.findOne({
			where: { setupCode: code.toLowerCase() },
		});

		if (!existing) {
			throw new NotFoundException('Invalid setup code.');
		}

		return existing;
	}

	/** Erase the setup code and mark the core as set up. Called after the admin account is created. */
	public async finalizeSetup(): Promise<CoreConfig> {
		const config = (await this.coreConfigRepository.find()).at(0);
		if (!config) throw new NotFoundException('Core config not found.');

		config.setupCode = null as any;
		config.isSetup = true;
		return this.coreConfigRepository.save(config);
	}

	public async updateDefault(input: UpdateCoreInput): Promise<CoreConfig> {
		const config = (await this.coreConfigRepository.find()).at(0);
		if (!config) {
			throw new NotFoundException('Core config not found. Run setup first.');
		}

		if (input.name !== undefined) {
			config.name = input.name;
		}

		if (input.icon) {
			const file = await input.icon;
			config.icon = await this.saveUpload(file.createReadStream(), file.filename);
		}

		return this.coreConfigRepository.save(config);
	}

	private async saveUpload(stream: NodeJS.ReadableStream, originalFilename: string): Promise<string> {
		await ensureDir(this.uploadsDir);

		const ext = originalFilename.includes('.') ? originalFilename.slice(originalFilename.lastIndexOf('.')) : '';
		const storedName = `${crypto.randomUUID()}${ext}`;
		const filePath = join(this.uploadsDir, storedName);

		const writer = createWriteStream(filePath);
		stream.pipe(writer);
		await finished(writer);

		this.logger.log(`Saved upload: ${originalFilename} → ${storedName}`);
		return storedName;
	}
}
