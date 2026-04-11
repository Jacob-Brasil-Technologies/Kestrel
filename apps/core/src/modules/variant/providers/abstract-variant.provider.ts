export interface ServerDownloadOptions {
	/** Path to the runtime executable (e.g., java binary, steamcmd) */
	runtimePath?: string;
	/** Optional callback to report progress messages to the caller */
	onProgress?: (message: string) => void;
}

export interface ServerDownloadResult {
	/** If omitted, the game type's default args template is used */
	serverArgs?: string[];
	/** Override the runtime executable for launching this server (e.g., native game binaries) */
	executableOverride?: string;
}

export abstract class AbstractVariantProvider {
	public abstract availableVersions(): Promise<string[]>;
	public abstract downloadServer(version: string, targetDir: string, options?: ServerDownloadOptions): Promise<ServerDownloadResult>;
}
