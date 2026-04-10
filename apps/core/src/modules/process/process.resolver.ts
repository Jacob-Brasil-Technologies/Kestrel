import { Args, ID, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { cpus, freemem, totalmem } from 'os';
import { InstanceStatus } from '../../shared/enums';
import { InstanceService } from '../instance/instance.service';
import { ConsoleLine } from './console-line.model';
import { CONSOLE_LOG_EVENT, ProcessService } from './process.service';
import { SystemStats } from './system-stats.model';

@Resolver()
export class ProcessResolver {
	constructor(
		private readonly processService: ProcessService,
		private readonly instanceService: InstanceService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	@Query(() => [ConsoleLine])
	public async consoleHistory(@Args('instanceId', { type: () => ID }) instanceId: string): Promise<ConsoleLine[]> {
		return this.processService.getConsoleHistory(instanceId);
	}

	@Query(() => SystemStats)
	public async systemStats(): Promise<SystemStats> {
		const instances = await this.instanceService.findAll();
		return {
			totalInstances: instances.length,
			runningInstances: instances.filter((i) => i.status === InstanceStatus.RUNNING).length,
			platform: process.platform,
			arch: process.arch,
			totalMemoryGB: Math.round((totalmem() / 1_073_741_824) * 100) / 100,
			freeMemoryGB: Math.round((freemem() / 1_073_741_824) * 100) / 100,
			cpuCount: cpus().length,
		};
	}

	@Mutation(() => Boolean)
	public async startServer(@Args('instanceId', { type: () => ID }) instanceId: string): Promise<boolean> {
		return this.processService.startServer(instanceId);
	}

	@Mutation(() => Boolean)
	public async stopServer(@Args('instanceId', { type: () => ID }) instanceId: string): Promise<boolean> {
		return this.processService.stopServer(instanceId);
	}

	@Mutation(() => Boolean)
	public async restartServer(@Args('instanceId', { type: () => ID }) instanceId: string): Promise<boolean> {
		return this.processService.restartServer(instanceId);
	}

	@Mutation(() => Boolean)
	public async sendCommand(@Args('instanceId', { type: () => ID }) instanceId: string, @Args('command') command: string): Promise<boolean> {
		return this.processService.sendCommand(instanceId, command);
	}

	@Subscription(() => ConsoleLine, {
		filter: (payload: { consoleLogs: ConsoleLine }, variables: { instanceId: string }) => {
			return payload.consoleLogs.instanceId === variables.instanceId;
		},
	})
	public consoleLogs(@Args('instanceId', { type: () => ID }) instanceId: string) {
		const iterator = this.createConsoleIterator(instanceId);
		return iterator;
	}

	private createConsoleIterator(instanceId: string): AsyncIterableIterator<{ consoleLogs: ConsoleLine }> {
		const eventEmitter = this.eventEmitter;
		const processService = this.processService;
		let historySent = false;
		const liveQueue: ConsoleLine[] = [];
		let liveResolve: ((value: IteratorResult<{ consoleLogs: ConsoleLine }>) => void) | null = null;
		let done = false;

		// Start listening immediately so we don't miss events during history fetch
		const onLog = (consoleLine: ConsoleLine) => {
			if (consoleLine.instanceId !== instanceId) return;
			if (liveResolve) {
				const resolve = liveResolve;
				liveResolve = null;
				resolve({ value: { consoleLogs: consoleLine }, done: false });
			} else {
				liveQueue.push(consoleLine);
			}
		};
		eventEmitter.on(CONSOLE_LOG_EVENT, onLog);

		let historyLines: ConsoleLine[] = [];
		let historyIndex = 0;

		return {
			[Symbol.asyncIterator]() {
				return this;
			},
			async next(): Promise<IteratorResult<{ consoleLogs: ConsoleLine }>> {
				if (done) return { value: undefined as any, done: true };

				// First, replay history
				if (!historySent) {
					if (historyIndex === 0) {
						historyLines = await processService.getConsoleHistory(instanceId);
					}
					if (historyIndex < historyLines.length) {
						const line = historyLines[historyIndex++];
						return { value: { consoleLogs: line }, done: false };
					}
					historySent = true;
				}

				// Then drain any queued live events
				if (liveQueue.length > 0) {
					const line = liveQueue.shift()!;
					return { value: { consoleLogs: line }, done: false };
				}

				// Wait for the next live event
				return new Promise((resolve) => {
					liveResolve = resolve;
				});
			},
			return(): Promise<IteratorResult<{ consoleLogs: ConsoleLine }>> {
				done = true;
				eventEmitter.off(CONSOLE_LOG_EVENT, onLog);
				return Promise.resolve({ value: undefined as any, done: true });
			},
			throw(): Promise<IteratorResult<{ consoleLogs: ConsoleLine }>> {
				done = true;
				eventEmitter.off(CONSOLE_LOG_EVENT, onLog);
				return Promise.resolve({ value: undefined as any, done: true });
			},
		};
	}
}
