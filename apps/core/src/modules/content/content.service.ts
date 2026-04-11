import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ensureDir, remove } from 'fs-extra';
import { join } from 'path';
import { Repository } from 'typeorm';
import { InstanceService } from '../instance/instance.service';
import { ContentType, CONTENT_DIRECTORIES } from './models/content-type.enum';
import { ContentProject } from './models/content-project.model';
import { ContentSearchResponse } from './models/content-search-result.model';
import { ContentVersion } from './models/content-version.model';
import { InstallContentInput } from './dto/install-content.input';
import { SearchContentInput } from './dto/search-content.input';
import { InstalledContent } from './installed-content.entity';
import { ModrinthProvider } from './providers/modrinth.provider';

@Injectable()
export class ContentService {
	private readonly logger = new Logger('ContentService');

	constructor(
		@InjectRepository(InstalledContent)
		private readonly installedContentRepository: Repository<InstalledContent>,
		private readonly instanceService: InstanceService,
		private readonly modrinthProvider: ModrinthProvider,
	) {}

	private getProvider(name?: string) {
		if (name && name !== 'modrinth') {
			throw new BadRequestException(`Unknown content provider: ${name}`);
		}
		return this.modrinthProvider;
	}

	async search(input: SearchContentInput): Promise<ContentSearchResponse> {
		const instance = await this.instanceService.findOne(input.instanceId);
		const provider = this.getProvider();
		const loaders = provider.getLoadersForVariant(instance.variant);

		return provider.search({
			query: input.query,
			gameVersion: instance.variantVersion,
			loaders,
			projectType: input.contentType ?? ContentType.MOD,
			limit: input.limit,
			offset: input.offset,
		});
	}

	async getProject(projectId: string): Promise<ContentProject> {
		return this.getProvider().getProject(projectId);
	}

	async getVersions(instanceId: string, projectId: string): Promise<ContentVersion[]> {
		const instance = await this.instanceService.findOne(instanceId);
		const provider = this.getProvider();
		const loaders = provider.getLoadersForVariant(instance.variant);

		return provider.getVersions(projectId, instance.variantVersion, loaders);
	}

	async install(input: InstallContentInput): Promise<InstalledContent> {
		const instance = await this.instanceService.findOne(input.instanceId);
		const provider = this.getProvider();

		// Check if this exact version is already installed
		const existing = await this.installedContentRepository.findOne({
			where: { instanceId: input.instanceId, projectId: input.projectId, versionId: input.versionId },
		});
		if (existing) {
			throw new BadRequestException('This version is already installed on this instance.');
		}

		const [project, version] = await Promise.all([provider.getProject(input.projectId), provider.getVersion(input.versionId)]);

		const contentType = project.projectType;
		if (contentType === ContentType.MODPACK) {
			throw new BadRequestException('Modpack installation is not yet supported. Install individual mods instead.');
		}

		const contentDir = CONTENT_DIRECTORIES[contentType];
		if (!contentDir) {
			throw new BadRequestException(`Unsupported content type: ${contentType}`);
		}

		const primaryFile = version.files.find((f) => f.primary) ?? version.files[0];
		if (!primaryFile) {
			throw new BadRequestException('No downloadable files found for this version.');
		}

		// If a different version of the same project is installed, replace it (upgrade)
		const existingProject = await this.installedContentRepository.findOne({
			where: { instanceId: input.instanceId, projectId: input.projectId },
		});
		if (existingProject) {
			await this.removeFile(instance.instancePath, existingProject.filePath);
			await this.installedContentRepository.remove(existingProject);
			this.logger.log(`Replaced ${existingProject.name} v${existingProject.versionNumber}`);
		}

		// Download to instance directory
		const targetDir = join(instance.instancePath, contentDir);
		await ensureDir(targetDir);
		const targetPath = join(targetDir, primaryFile.filename);
		const relativePath = join(contentDir, primaryFile.filename);

		this.logger.log(`Downloading ${project.title} v${version.versionNumber} → ${relativePath}`);
		await provider.downloadFile(primaryFile.url, targetPath);

		const installed = this.installedContentRepository.create({
			instanceId: input.instanceId,
			provider: provider.name,
			projectId: input.projectId,
			versionId: input.versionId,
			contentType,
			name: project.title,
			iconUrl: project.iconUrl,
			versionNumber: version.versionNumber,
			fileName: primaryFile.filename,
			filePath: relativePath,
			fileHash: primaryFile.sha1,
		});
		await this.installedContentRepository.save(installed);

		this.logger.log(`Installed ${project.title} v${version.versionNumber} on instance "${instance.name}"`);
		return installed;
	}

	async uninstall(installedContentId: string): Promise<boolean> {
		const content = await this.installedContentRepository.findOne({
			where: { id: installedContentId },
			relations: ['instance'],
		});
		if (!content) {
			throw new NotFoundException('Installed content not found.');
		}

		await this.removeFile(content.instance.instancePath, content.filePath);
		await this.installedContentRepository.remove(content);

		this.logger.log(`Uninstalled ${content.name} from instance ${content.instanceId}`);
		return true;
	}

	async getInstalledContent(instanceId: string): Promise<InstalledContent[]> {
		return this.installedContentRepository.find({ where: { instanceId } });
	}

	private async removeFile(instancePath: string, relativePath: string): Promise<void> {
		const fullPath = join(instancePath, relativePath);
		try {
			await remove(fullPath);
		} catch (err: any) {
			this.logger.warn(`Failed to remove file ${fullPath}: ${err.message}`);
		}
	}
}
