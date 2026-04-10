import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstanceModule } from '../instance/instance.module';
import { ConsoleLog } from './console-log.entity';
import { ProcessResolver } from './process.resolver';
import { ProcessService } from './process.service';

@Module({
	imports: [InstanceModule, TypeOrmModule.forFeature([ConsoleLog])],
	providers: [ProcessResolver, ProcessService],
})
export class ProcessModule {}
