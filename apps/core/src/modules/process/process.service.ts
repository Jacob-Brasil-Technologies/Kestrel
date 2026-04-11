import { GameType } from '@kestrel/types';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildProcess, spawn } from 'child_process';
import { existsSync } from 'fs';
import { access, chmod, constants } from 'fs/promises';
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
	private pendingLogs: ConsoleLog[] = [];
	private flushTimer: ReturnType<typeof setTimeout> | null = null;
	private readonly FLUSH_INTERVAL_MS = 250;

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
		if (this.flushTimer) clearTimeout(this.flushTimer);
		void this.flushLogs();
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

	/** Find the system dynamic linker (ld-linux) for executing ELF binaries without +x */
	private findDynamicLinker(): string | null {
		const candidates = [
			'/lib64/ld-linux-x86-64.so.2',
			'/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2',
			'/lib/ld-linux-x86-64.so.2',
			'/lib/ld-linux-aarch64.so.1',
			'/lib64/ld-linux-aarch64.so.1',
			'/lib/aarch64-linux-gnu/ld-linux-aarch64.so.1',
		];
		return candidates.find((p) => existsSync(p)) ?? null;
	}

	/** Check if a file has execute permission */
	private async isExecutable(filePath: string): Promise<boolean> {
		try {
			await access(filePath, constants.X_OK);
			return true;
		} catch {
			return false;
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

		// Emit the event immediately so subscriptions are real-time
		const consoleLine: ConsoleLine = {
			instanceId,
			line,
			timestamp: log.createdAt,
			source,
		};
		this.eventEmitter.emit(CONSOLE_LOG_EVENT, consoleLine);

		// Batch the DB write
		this.pendingLogs.push(log);
		this.scheduleFlush();
	}

	private scheduleFlush(): void {
		if (this.flushTimer) return;
		this.flushTimer = setTimeout(() => {
			this.flushTimer = null;
			void this.flushLogs();
		}, this.FLUSH_INTERVAL_MS);
	}

	private async flushLogs(): Promise<void> {
		if (this.pendingLogs.length === 0) return;
		const batch = this.pendingLogs;
		this.pendingLogs = [];
		try {
			await this.consoleLogRepository.save(batch);
		} catch (err) {
			this.logger.error(`Failed to flush ${batch.length} console logs: ${err}`);
		}
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
				this.logger.warn(`Could not chmod ${runtimePath} — will try fallback`);
			}
		}

		// Determine how to spawn the executable:
		// 1. Shell scripts (.sh) → run via /bin/sh
		// 2. Non-executable ELF binaries → run via the dynamic linker (ld-linux)
		//    This handles Docker volumes (e.g. Unraid) where chmod doesn't work.
		// 3. Normal executables → run directly
		let spawnCmd: string;
		let spawnArgs: string[];
		const args = this.instanceService.resolveArgs(instance.serverArgs ?? [], instance);

		const isShellScript = runtimePath.endsWith('.sh');
		const executable = !isShellScript && await this.isExecutable(runtimePath);

		if (isShellScript) {
			spawnCmd = '/bin/sh';
			spawnArgs = [runtimePath, ...args];
		} else if (!executable && process.platform === 'linux') {
			const ldso = this.findDynamicLinker();
			if (ldso) {
				this.logger.warn(`Using dynamic linker to execute ${runtimePath} (no +x permission)`);
				spawnCmd = ldso;
				spawnArgs = [runtimePath, ...args];
			} else {
				spawnCmd = runtimePath;
				spawnArgs = args;
			}
		} else {
			spawnCmd = runtimePath;
			spawnArgs = args;
		}

		const child = spawn(spawnCmd, spawnArgs, {
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
