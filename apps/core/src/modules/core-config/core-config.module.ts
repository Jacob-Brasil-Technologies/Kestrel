import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreConfig } from './core-config.entity';
import { CoreConfigResolver } from './core-config.resolver';
import { CoreConfigService } from './core-config.service';

@Module({
	imports: [TypeOrmModule.forFeature([CoreConfig])],
	providers: [CoreConfigResolver, CoreConfigService],
	exports: [CoreConfigService],
})
export class CoreConfigModule {}