import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstanceModule } from '../instance/instance.module';
import { ContentResolver } from './content.resolver';
import { ContentService } from './content.service';
import { InstalledContent } from './installed-content.entity';
import { ModrinthProvider } from './providers/modrinth.provider';

@Module({
	imports: [TypeOrmModule.forFeature([InstalledContent]), InstanceModule],
	providers: [ContentResolver, ContentService, ModrinthProvider],
	exports: [ContentService],
})
export class ContentModule {}
