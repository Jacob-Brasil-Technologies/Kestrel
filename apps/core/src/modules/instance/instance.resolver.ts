import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameInfoDto } from '../variant/dto/game-info.dto';
import { VariantInfoDto } from '../variant/dto/variant-info.dto';
import { VariantService } from '../variant/variant.service';
import { CreateInstanceInput } from './dto/create-instance.input';
import { UpdateInstanceInput } from './dto/update-instance.input';
import { Instance } from './instance.entity';
import { InstanceSetupLog, INSTANCE_SETUP_LOG_EVENT } from './instance-setup-log.model';
import { InstanceService } from './instance.service';

@Resolver(() => Instance)
export class InstanceResolver {
	constructor(
		private readonly instanceService: InstanceService,
		private readonly variantService: VariantService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	@Query(() => [Instance])
	public async instances(): Promise<Instance[]> {
		return this.instanceService.findAll();
	}

	@Query(() => Instance)
	public async instance(@Args('id', { type: () => ID }) id: string): Promise<Instance> {
		return this.instanceService.findOne(id);
	}

	@Mutation(() => Instance)
	public async createInstance(@Args('input') input: CreateInstanceInput): Promise<Instance> {
		return this.instanceService.createInstance(input);
	}

	@Mutation(() => Instance)
	public async updateInstance(
		@Args('id', { type: () => ID }) id: string,
		@Args('input') input: UpdateInstanceInput,
	): Promise<Instance> {
		return this.instanceService.updateInstance(id, input);
	}

	@Mutation(() => Boolean)
	public async deleteInstance(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
		return this.instanceService.deleteInstance(id);
	}

	@ResolveField(() => GameInfoDto)
	public gameInfo(@Parent() instance: Instance): GameInfoDto {
		return this.variantService.getGameInfo(instance.gameType);
	}

	@ResolveField(() => VariantInfoDto)
	public variantInfo(@Parent() instance: Instance): VariantInfoDto {
		return this.variantService.getVariantInfo(instance.gameType, instance.variant)!;
	}

	@Subscription(() => InstanceSetupLog, {
		filter: (payload: { instanceSetupLogs: InstanceSetupLog }, variables: { correlationId: string }) =>
			payload.instanceSetupLogs.correlationId === variables.correlationId,
	})
	public instanceSetupLogs(@Args('correlationId') correlationId: string) {
		const eventEmitter = this.eventEmitter;
		const instanceService = this.instanceService;
		const queue: InstanceSetupLog[] = [];
		let resolve: ((value: IteratorResult<{ instanceSetupLogs: InstanceSetupLog }>) => void) | null = null;
		let done = false;
		let historySent = false;
		let historyLines: InstanceSetupLog[] = [];
		let historyIndex = 0;
		const seen = new Set<object>();

		// Start listening immediately so we don't miss events during history replay
		const onLog = (log: InstanceSetupLog) => {
			if (log.correlationId !== correlationId) return;
			if (resolve) {
				const r = resolve;
				resolve = null;
				r({ value: { instanceSetupLogs: log }, done: false });
			} else {
				queue.push(log);
			}
		};
		eventEmitter.on(INSTANCE_SETUP_LOG_EVENT, onLog);

		return {
			[Symbol.asyncIterator]() {
				return this;
			},
			async next(): Promise<IteratorResult<{ instanceSetupLogs: InstanceSetupLog }>> {
				if (done) return { value: undefined as any, done: true };

				// Replay buffered history first
				if (!historySent) {
					if (historyIndex === 0) {
						historyLines = instanceService.getBufferedSetupLogs(correlationId);
						historyLines.forEach((l) => seen.add(l));
					}
					if (historyIndex < historyLines.length) {
						const line = historyLines[historyIndex++];
						return { value: { instanceSetupLogs: line }, done: false };
					}
					historySent = true;
					// Drop live queue entries that were already replayed from the buffer
					while (queue.length > 0 && seen.has(queue[0])) {
						queue.shift();
					}
				}

				if (queue.length > 0) {
					return { value: { instanceSetupLogs: queue.shift()! }, done: false };
				}
				return new Promise((r) => {
					resolve = r;
				});
			},
			return() {
				done = true;
				eventEmitter.off(INSTANCE_SETUP_LOG_EVENT, onLog);
				instanceService.clearSetupLogBuffer(correlationId);
				return Promise.resolve({ value: undefined as any, done: true });
			},
		};
	}
}
