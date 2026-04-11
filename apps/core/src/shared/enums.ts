import { GameType, GameVariant, RuntimeType } from '@kestrel/types';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(RuntimeType, { name: 'RuntimeType' });
registerEnumType(GameType, { name: 'GameType' });
registerEnumType(GameVariant, { name: 'GameVariant' });

export enum InstanceStatus {
	STOPPED = 'stopped',
	STARTING = 'starting',
	RUNNING = 'running',
	STOPPING = 'stopping',
	CRASHED = 'crashed',
}

registerEnumType(InstanceStatus, { name: 'InstanceStatus' });
