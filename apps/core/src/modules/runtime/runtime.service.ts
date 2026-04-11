import { RuntimeType } from '@kestrel/types';
import { Injectable } from '@nestjs/common';
import { AbstractRuntimeProvider } from './providers/abstract-runtime.provider';
import { JavaRuntimeProvider } from './providers/java-runtime.provider';
import { NativeRuntimeProvider } from './providers/native-runtime.provider';
import { SteamcmdRuntimeProvider } from './providers/steamcmd-runtime.provider';

@Injectable()
export class RuntimeService {
	private readonly handlers: Map<RuntimeType, AbstractRuntimeProvider>;

	constructor(
		private readonly javaRuntimeService: JavaRuntimeProvider,
		private readonly steamcmdRuntimeService: SteamcmdRuntimeProvider,
		private readonly nativeRuntimeService: NativeRuntimeProvider,
	) {
		this.handlers = new Map<RuntimeType, AbstractRuntimeProvider>([
			[RuntimeType.Java, this.javaRuntimeService],
			[RuntimeType.Steamcmd, this.steamcmdRuntimeService],
			[RuntimeType.Native, this.nativeRuntimeService],
		]);
	}

	public with(type: RuntimeType): AbstractRuntimeProvider {
		const handler = this.handlers.get(type);
		if (!handler) {
			throw new Error(`No runtime provider registered for type: ${type}`);
		}
		return handler;
	}
}
