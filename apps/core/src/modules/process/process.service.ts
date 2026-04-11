import { GameType } from '@kestrel/types';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildProcess, spawn } from 'child_process';
import { existsSync } from 'fs';
import { chmod } from 'fs/promises';
import { resolve, join } from 'path';
import { createInterface } from 'readline';
import { Repository } from 'typeorm';
import { InstanceStatus } from '../../shared/enums';
import { InstanceService } from '../instance/instance.service';
import { ConsoleLog } from './console-log.entity';
import { ConsoleLine, ConsoleSource } from './console-line.model';

export const CONSOLE_LOG_EVENT = 'console.log';

@Injectable()
export class ProcessService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger('ProcessService');
	private readonly processes = new Map<string, ChildProcess>();
	private readonly sessionTimestamps = new Map<string, number>();

	constructor(
		private readonly instanceService: InstanceService,
		private readonly eventEmitter: EventEmitter2,
		@InjectRepository(ConsoleLog)
		private readonly consoleLogRepository: Repository<ConsoleLog>,
	) {}

	async onModuleInit(): Promise<void> {
		await this.reconcileOrphanedProcesses();
	}

	onModuleDestroy(): void {
		for (const [instanceId, proc] of this.processes) {
			this.logger.warn(`Shutting down process for instance ${instanceId} (PID: ${proc.pid})`);
			proc.kill('SIGTERM');
		}
	}

	private async reconcileOrphanedProcesses(): Promise<void> {
		const instances = await this.instanceService.findAll();
		const runningInstances = instances.filter((i) => i.status === InstanceStatus.RUNNING || i.status === InstanceStatus.STARTING);

		for (const instance of runningInstances) {
			if (instance.pid) {
				try {
					process.kill(instance.pid, 0);
					this.logger.warn(`Orphaned process detected for "${instance.name}" (PID: ${instance.pid}). Terminating.`);
					process.kill(instance.pid, 'SIGTERM');
				} catch {
					// Process already dead
				}
			}
			await this.instanceService.updateStatus(instance.id, InstanceStatus.STOPPED, null);
			this.logger.log(`Marked orphaned instance "${instance.name}" as STOPPED.`);
		}
	}

	private validateInstancePath(instancePath: string): void {
		const instancesRoot = resolve(join(process.cwd(), 'data', 'instances'));
		const resolvedPath = resolve(instancePath);
		if (!resolvedPath.startsWith(instancesRoot + '/') && resolvedPath !== instancesRoot) {
			throw new Error('Security violation: instance path is outside the instances directory');
		}
	}

	private async pushConsoleLine(instanceId: string, line: string, source: ConsoleSource): Promise<void> {
		const sessionStartedAt = this.sessionTimestamps.get(instanceId) ?? Date.now();

		const log = this.consoleLogRepository.create({
			instanceId,
			line,
			source,
			sessionStartedAt,
		});
		await this.consoleLogRepository.save(log);

		const consoleLine: ConsoleLine = {
			instanceId,
			line,
			timestamp: log.createdAt,
			source,
		};

		this.eventEmitter.emit(CONSOLE_LOG_EVENT, consoleLine);
	}

	public async getConsoleHistory(instanceId: string): Promise<ConsoleLine[]> {
		// Get the most recent session start time
		const latestSession = await this.consoleLogRepository.findOne({
			where: { instanceId, source: ConsoleSource.SYSTEM },
			order: { sessionStartedAt: 'DESC' },
		});

		if (!latestSession) return [];

		const logs = await this.consoleLogRepository.find({
			where: { instanceId, sessionStartedAt: latestSession.sessionStartedAt },
			order: { createdAt: 'ASC' },
		});

		return logs.map((log) => ({
			instanceId: log.instanceId,
			line: log.line,
			timestamp: log.createdAt,
			source: log.source,
		}));
	}

	/** Returns a function that detects when a game server has finished starting */
	private getStartupDetector(gameType: GameType): (line: string) => boolean {
		switch (gameType) {
			case GameType.Minecraft:
				return (line) => line.includes('Done') && line.includes('For help');
			case GameType.Satisfactory:
				return (line) => line.includes('Server startup complete');
			case GameType.Factorio:
				return (line) => line.includes('Hosting game at');
			default:
				return () => false;
		}
	}

	/** Returns the appropriate stop command for a game type */
	private getStopCommand(gameType: GameType): string | null {
		switch (gameType) {
			case GameType.Minecraft:
				return 'stop';
			default:
				return null;
		}
	}

	public async startServer(instanceId: string): Promise<boolean> {
		const instance = await this.instanceService.findOne(instanceId);

		if (this.processes.has(instanceId)) {
			throw new Error(`Server "${instance.name}" is already running.`);
		}

		this.validateInstancePath(instance.instancePath);

		const runtimePath = instance.executableOverride ?? instance.runtime.executablePath;
		if (!existsSync(runtimePath)) {
			throw new Error(`Executable not found at ${runtimePath}. The runtime may need to be reinstalled.`);
		}

		await this.instanceService.updateStatus(instanceId, InstanceStatus.STARTING);

		const sessionStartedAt = Date.now();
		this.sessionTimestamps.set(instanceId, sessionStartedAt);

		await this.pushConsoleLine(instanceId, `Starting server "${instance.name}"...`, ConsoleSource.SYSTEM);

		// Ensure executable permissions (critical in Docker / Linux)
		if (process.platform !== 'win32') {
			try {
				await chmod(runtimePath, 0o755);
			} catch {
				this.logger.warn(`Could not chmod ${runtimePath} — may already be executable`);
			}
		}

		const child = spawn(runtimePath, instance.serverArgs ?? [], {
			cwd: instance.instancePath,
			stdio: ['pipe', 'pipe', 'pipe'],
		});

		// Attach error handler IMMEDIATELY to prevent unhandled 'error' events.
		// Without this, a spawn failure (EACCES, ENOENT) emits 'error' on the
		// next tick — if we throw before attaching, Node crashes.
		child.on('error', (err) => {
			this.logger.error(`Process error for "${instance.name}": ${err.message}`);
			this.processes.delete(instanceId);
			void this.pushConsoleLine(instanceId, `Process error: ${err.message}`, ConsoleSource.SYSTEM);
			void this.instanceService.updateStatus(instanceId, InstanceStatus.CRASHED, null);
		});

		if (!child.pid) {
			await this.instanceService.updateStatus(instanceId, InstanceStatus.CRASHED);
			throw new Error('Failed to spawn server process.');
		}

		this.processes.set(instanceId, child);
		await this.instanceService.updateStatus(instanceId, InstanceStatus.STARTING, child.pid);

		const startupDetector = this.getStartupDetector(instance.gameType);

		if (child.stdout) {
			const stdoutRl = createInterface({ input: child.stdout });
			stdoutRl.on('line', (line) => {
				void this.pushConsoleLine(instanceId, line, ConsoleSource.STDOUT);
				if (startupDetector(line)) {
					void this.instanceService.updateStatus(instanceId, InstanceStatus.RUNNING, child.pid ?? null);
				}
			});
		}

		if (child.stderr) {
			const stderrRl = createInterface({ input: child.stderr });
			stderrRl.on('line', (line) => {
				void this.pushConsoleLine(instanceId, line, ConsoleSource.STDERR);
			});
		}

		child.on('exit', (code, signal) => {
			this.processes.delete(instanceId);
			const reason = signal ? `signal ${signal}` : `code ${code}`;
			void this.pushConsoleLine(instanceId, `Server process exited (${reason}).`, ConsoleSource.SYSTEM);

			void this.instanceService.findOne(instanceId).then((inst) => {
				if (inst.status === InstanceStatus.STOPPING) {
					void this.instanceService.updateStatus(instanceId, InstanceStatus.STOPPED, null);
				} else {
					void this.instanceService.updateStatus(instanceId, InstanceStatus.CRASHED, null);
				}
			});
		});

		this.logger.log(`Server "${instance.name}" started (PID: ${child.pid}).`);
		return true;
	}

	public async stopServer(instanceId: string): Promise<boolean> {
		const instance = await this.instanceService.findOne(instanceId);
		const child = this.processes.get(instanceId);

		if (!child) {
			throw new Error(`Server "${instance.name}" is not running.`);
		}

		await this.instanceService.updateStatus(instanceId, InstanceStatus.STOPPING);
		await this.pushConsoleLine(instanceId, 'Sending stop command...', ConsoleSource.SYSTEM);

		const stopCommand = this.getStopCommand(instance.gameType);
		if (stopCommand) {
			child.stdin?.write(stopCommand + '\n');
		} else {
			child.kill('SIGTERM');
		}

		const forceKillTimeout = setTimeout(() => {
			if (this.processes.has(instanceId)) {
				this.logger.warn(`Force killing server "${instance.name}" after timeout.`);
				child.kill('SIGKILL');
			}
		}, 30_000);

		child.once('exit', () => {
			clearTimeout(forceKillTimeout);
		});

		return true;
	}

	public async restartServer(instanceId: string): Promise<boolean> {
		const child = this.processes.get(instanceId);

		if (child) {
			await this.stopServer(instanceId);
			await new Promise<void>((res) => {
				child.once('exit', () => res());
				setTimeout(() => res(), 35_000);
			});
		}

		return this.startServer(instanceId);
	}

	public async sendCommand(instanceId: string, command: string): Promise<boolean> {
		const instance = await this.instanceService.findOne(instanceId);
		const child = this.processes.get(instanceId);

		if (!child) {
			throw new Error(`Server "${instance.name}" is not running.`);
		}

		await this.pushConsoleLine(instanceId, `> ${command}`, ConsoleSource.SYSTEM);
		child.stdin?.write(command + '\n');
		return true;
	}

	public isRunning(instanceId: string): boolean {
		return this.processes.has(instanceId);
	}
}
