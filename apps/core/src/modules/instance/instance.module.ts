import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuntimeModule } from '../runtime/runtime.module';
import { VariantModule } from '../variant/variant.module';
import { Instance } from './instance.entity';
import { InstanceResolver } from './instance.resolver';
import { InstanceService } from './instance.service';

@Module({
	imports: [TypeOrmModule.forFeature([Instance]), RuntimeModule, VariantModule],
	providers: [InstanceResolver, InstanceService],
	exports: [InstanceService],
})
export class InstanceModule {}
