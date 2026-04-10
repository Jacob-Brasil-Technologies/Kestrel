import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JavaRuntimeProvider } from './providers/java-runtime.provider';
import { NativeRuntimeProvider } from './providers/native-runtime.provider';
import { SteamcmdRuntimeProvider } from './providers/steamcmd-runtime.provider';
import { Runtime } from './runtime.entity';
import { RuntimeResolver } from './runtime.resolver';
import { RuntimeService } from './runtime.service';

@Module({
	imports: [TypeOrmModule.forFeature([Runtime])],
	providers: [RuntimeResolver, RuntimeService, JavaRuntimeProvider, SteamcmdRuntimeProvider, NativeRuntimeProvider],
	exports: [RuntimeService],
})
export class RuntimeModule {}
