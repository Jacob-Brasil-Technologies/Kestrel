// AUTO-GENERATED FILE — DO NOT EDIT
// Generated from *.game-type.json files. Run `pnpm generate` to regenerate.

// ============================================================
// Interfaces
// ============================================================

export interface GameTypeDetails {
	name: string;
	developer: string;
	icon: string;
	developerIcon: string;
	runtime: RuntimeType;
	args: string[];
	supportedPlatforms: string[];
}

export interface VariantDetails {
	name: string;
	desc: string;
	icon: string;
}

export interface ModProviderDetails {
	name: string;
	desc: string;
	icon: string;
}

export type ConfigValueType = 'string' | 'number' | 'boolean' | 'enum';

export interface ConfigurationLine {
	name: string;
	desc: string;
	category: 'Networking' | 'World' | 'Server' | 'Gameplay' | 'Performance' | 'Admin' | 'Other' | 'Customization';
	linePrefix: string;
	valueType: ConfigValueType;
	enumOptions?: string[];
	default?: string;
}

export interface ConfigurationFile {
	filePath: string;
	lines: ConfigurationLine[];
}

// ============================================================
// Enums
// ============================================================

export enum RuntimeType {
	Java = 'java',
	Native = 'native',
	Steamcmd = 'steamcmd',
}

export enum GameType {
	Factorio = 'factorio',
	Minecraft = 'minecraft',
	Satisfactory = 'satisfactory',
}

export enum FactorioGameVariant {
	Vanilla = 'vanilla',
}

export enum MinecraftGameVariant {
	Vanilla = 'vanilla',
	Fabric = 'fabric',
	NeoForge = 'neoForge',
	Paper = 'paper',
}

export enum SatisfactoryGameVariant {
	Vanilla = 'vanilla',
}

/** Base variant */

export type TGameVariant = FactorioGameVariant | MinecraftGameVariant | SatisfactoryGameVariant

export const GameVariant = {
	...FactorioGameVariant,
	...MinecraftGameVariant,
	...SatisfactoryGameVariant,
};

export enum MinecraftModProvider {
	Modrinth = 'modrinth',
	CurseForge = 'curseForge',
}

// ============================================================
// Type Mapping
// ============================================================

export type GameVariantMap = {
	[GameType.Factorio]: FactorioGameVariant;
	[GameType.Minecraft]: MinecraftGameVariant;
	[GameType.Satisfactory]: SatisfactoryGameVariant;
};

export type GameModProviderMap = {
	[GameType.Minecraft]: MinecraftModProvider;
};

// ============================================================
// Data
// ============================================================

const GAME_TYPE_DETAILS: Record<GameType, GameTypeDetails> = {
	[GameType.Factorio]: {
		name: 'Factorio',
		developer: 'Wube Software',
		icon: 'factorio.png',
		developerIcon: 'wube-software.jpeg',
		runtime: RuntimeType.Native,
		args: [],
		supportedPlatforms: ['linux'],
	},
	[GameType.Minecraft]: {
		name: 'Minecraft',
		developer: 'Mojang Studios',
		icon: 'minecraft.png',
		developerIcon: 'mojang.png',
		runtime: RuntimeType.Java,
		args: ['-Xmx{{MAX_MEMORY}}', '-Xms{{MIN_MEMORY}}', '-jar', 'server.jar', 'nogui'],
		supportedPlatforms: ['linux', 'windows', 'darwin'],
	},
	[GameType.Satisfactory]: {
		name: 'Satisfactory',
		developer: 'Coffee Stain Studios',
		icon: 'satisfactory.png',
		developerIcon: 'coffee-stain-studios.jpg',
		runtime: RuntimeType.Steamcmd,
		args: [],
		supportedPlatforms: ['linux', 'windows'],
	},
};

const VARIANT_DETAILS: Record<GameType, Record<string, VariantDetails>> = {
	[GameType.Factorio]: {
		[FactorioGameVariant.Vanilla]: {
			name: 'Vanilla',
			desc: 'The standard headless Factorio dedicated server',
			icon: 'factorio.png',
		},
	},
	[GameType.Minecraft]: {
		[MinecraftGameVariant.Vanilla]: {
			name: 'Vanilla',
			desc: 'Vanilla Minecraft',
			icon: 'minecraft.png',
		},
		[MinecraftGameVariant.Fabric]: {
			name: 'Fabric',
			desc: 'Fabric mod loader',
			icon: 'fabric.png',
		},
		[MinecraftGameVariant.NeoForge]: {
			name: 'NeoForge',
			desc: 'NeoForge mod loader',
			icon: 'neoforge.png',
		},
		[MinecraftGameVariant.Paper]: {
			name: 'Paper',
			desc: 'Paper server software',
			icon: 'paper.webp',
		},
	},
	[GameType.Satisfactory]: {
		[SatisfactoryGameVariant.Vanilla]: {
			name: 'Vanilla',
			desc: 'The standard version of Satisfactory',
			icon: 'satisfactory.png',
		},
	},
};

const MOD_PROVIDER_DETAILS: Partial<Record<GameType, ModProviderDetails[]>> = {
	[GameType.Minecraft]: [
		{
			name: 'Modrinth',
			desc: 'A modern mod hosting platform with a focus on performance and user experience',
			icon: 'modrinth.webp',
		},
		{
			name: 'CurseForge',
			desc: 'A popular mod hosting platform with a large selection of mods and modpacks',
			icon: 'curseforge.webp',
		},
	],
};

const CONFIGURATIONS: Partial<Record<GameType, ConfigurationFile[]>> = {
	[GameType.Minecraft]: [
		{
			filePath: 'eula.txt',
			lines: [
				{
					name: 'EULA Accepted',
					desc: 'Whether the EULA is accepted, required to start the server',
					category: 'Other',
					linePrefix: 'eula=',
					valueType: 'boolean',
					default: 'true',
				},
			],
		},
		{
			filePath: 'server.properties',
			lines: [
				{
					name: 'Game mode',
					desc: 'The default game mode for players when they join the server',
					category: 'Gameplay',
					linePrefix: 'gamemode=',
					valueType: 'enum',
					enumOptions: ['survival', 'creative', 'adventure', 'spectator'],
					default: 'survival',
				},
				{
					name: 'Difficulty',
					desc: 'The difficulty level of the game',
					category: 'Gameplay',
					linePrefix: 'difficulty=',
					valueType: 'enum',
					enumOptions: ['peaceful', 'easy', 'normal', 'hard'],
					default: 'easy',
				},
				{
					name: 'Allow flight',
					desc: 'Whether players are allowed to use flight in survival mode',
					category: 'Gameplay',
					linePrefix: 'allow-flight=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Enable command block',
					desc: 'Whether command blocks are enabled on the server',
					category: 'Gameplay',
					linePrefix: 'enable-command-block=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Force game mode',
					desc: 'Whether to force players into the default game mode when they join',
					category: 'Gameplay',
					linePrefix: 'force-gamemode=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Hardcore',
					desc: 'Whether the server is in hardcore mode, where players are banned upon death',
					category: 'Gameplay',
					linePrefix: 'hardcore=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Max players',
					desc: 'The maximum number of players that can join the server',
					category: 'Server',
					linePrefix: 'max-players=',
					valueType: 'number',
					default: '20',
				},
				{
					name: 'Accepts transfers',
					desc: 'Whether the server accepts player transfers from other servers',
					category: 'Server',
					linePrefix: 'accepts-transfers=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Enable status',
					desc: 'Whether the server appears as online on the server list',
					category: 'Server',
					linePrefix: 'enable-status=',
					valueType: 'boolean',
					default: 'true',
				},
				{
					name: 'Enforce secure profile',
					desc: 'Whether players must have a Mojang-signed public key to join',
					category: 'Server',
					linePrefix: 'enforce-secure-profile=',
					valueType: 'boolean',
					default: 'true',
				},
				{
					name: 'Hide online players',
					desc: 'Whether to hide the list of online players from the server status',
					category: 'Server',
					linePrefix: 'hide-online-players=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'MOTD',
					desc: 'The message of the day displayed in the server list',
					category: 'Server',
					linePrefix: 'motd=',
					valueType: 'string',
					default: 'A Minecraft Server',
				},
				{
					name: 'Online mode',
					desc: 'Whether the server verifies players against Minecraft\'s authentication servers',
					category: 'Server',
					linePrefix: 'online-mode=',
					valueType: 'boolean',
					default: 'true',
				},
				{
					name: 'Player idle timeout',
					desc: 'The number of minutes a player can be idle before being kicked (0 to disable)',
					category: 'Server',
					linePrefix: 'player-idle-timeout=',
					valueType: 'number',
					default: '0',
				},
				{
					name: 'Enable code of conduct',
					desc: 'Whether to enable the Minecraft code of conduct screen',
					category: 'Server',
					linePrefix: 'enable-code-of-conduct=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Bug report link',
					desc: 'A URL for players to report bugs',
					category: 'Server',
					linePrefix: 'bug-report-link=',
					valueType: 'string',
					default: '',
				},
				{
					name: 'Status heartbeat interval',
					desc: 'The interval in seconds between server status heartbeats',
					category: 'Server',
					linePrefix: 'status-heartbeat-interval=',
					valueType: 'number',
					default: '0',
				},
				{
					name: 'Text filtering config',
					desc: 'The path to the text filtering configuration file',
					category: 'Server',
					linePrefix: 'text-filtering-config=',
					valueType: 'string',
					default: '',
				},
				{
					name: 'Text filtering version',
					desc: 'The version of the text filtering system to use',
					category: 'Server',
					linePrefix: 'text-filtering-version=',
					valueType: 'number',
					default: '0',
				},
				{
					name: 'Generate structures',
					desc: 'Whether to generate structures such as villages and dungeons',
					category: 'World',
					linePrefix: 'generate-structures=',
					valueType: 'boolean',
					default: 'true',
				},
				{
					name: 'Generator settings',
					desc: 'Custom world generator settings in JSON format',
					category: 'World',
					linePrefix: 'generator-settings=',
					valueType: 'string',
					default: '{}',
				},
				{
					name: 'Level name',
					desc: 'The name of the world folder',
					category: 'World',
					linePrefix: 'level-name=',
					valueType: 'string',
					default: 'world',
				},
				{
					name: 'Level seed',
					desc: 'The seed used for world generation (leave blank for random)',
					category: 'World',
					linePrefix: 'level-seed=',
					valueType: 'string',
					default: '',
				},
				{
					name: 'Level type',
					desc: 'The type of world to generate',
					category: 'World',
					linePrefix: 'level-type=',
					valueType: 'enum',
					enumOptions: ['minecraft\\:normal', 'minecraft\\:flat', 'minecraft\\:large_biomes', 'minecraft\\:amplified', 'minecraft\\:single_biome_surface'],
					default: 'minecraft\\:normal',
				},
				{
					name: 'Max world size',
					desc: 'The maximum radius of the world border in blocks',
					category: 'World',
					linePrefix: 'max-world-size=',
					valueType: 'number',
					default: '29999984',
				},
				{
					name: 'Spawn protection',
					desc: 'The radius of blocks around the spawn point that are protected from non-op players',
					category: 'World',
					linePrefix: 'spawn-protection=',
					valueType: 'number',
					default: '16',
				},
				{
					name: 'Server port',
					desc: 'The port the server listens on',
					category: 'Networking',
					linePrefix: 'server-port=',
					valueType: 'number',
					default: '25565',
				},
				{
					name: 'Server IP',
					desc: 'The IP address to bind the server to (leave blank to bind to all interfaces)',
					category: 'Networking',
					linePrefix: 'server-ip=',
					valueType: 'string',
					default: '',
				},
				{
					name: 'Enable query',
					desc: 'Whether to enable the GameSpy4 query protocol for server information',
					category: 'Networking',
					linePrefix: 'enable-query=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Query port',
					desc: 'The port for the query protocol listener',
					category: 'Networking',
					linePrefix: 'query.port=',
					valueType: 'number',
					default: '25565',
				},
				{
					name: 'Network compression threshold',
					desc: 'The minimum packet size in bytes before compression is applied (-1 to disable)',
					category: 'Networking',
					linePrefix: 'network-compression-threshold=',
					valueType: 'number',
					default: '256',
				},
				{
					name: 'Prevent proxy connections',
					desc: 'Whether to kick players detected as using a VPN or proxy',
					category: 'Networking',
					linePrefix: 'prevent-proxy-connections=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Rate limit',
					desc: 'The maximum number of packets per second before a player is kicked (0 to disable)',
					category: 'Networking',
					linePrefix: 'rate-limit=',
					valueType: 'number',
					default: '0',
				},
				{
					name: 'Enable JMX monitoring',
					desc: 'Whether to expose an MBean for JMX monitoring',
					category: 'Performance',
					linePrefix: 'enable-jmx-monitoring=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Entity broadcast range percentage',
					desc: 'The percentage of the default entity broadcast range (10–1000)',
					category: 'Performance',
					linePrefix: 'entity-broadcast-range-percentage=',
					valueType: 'number',
					default: '100',
				},
				{
					name: 'Max chained neighbor updates',
					desc: 'The maximum number of consecutive neighbor updates before skipping further updates',
					category: 'Performance',
					linePrefix: 'max-chained-neighbor-updates=',
					valueType: 'number',
					default: '1000000',
				},
				{
					name: 'Max tick time',
					desc: 'The maximum time in milliseconds a single tick may take before the server watchdog stops the server (-1 to disable)',
					category: 'Performance',
					linePrefix: 'max-tick-time=',
					valueType: 'number',
					default: '60000',
				},
				{
					name: 'Pause when empty seconds',
					desc: 'The number of seconds after all players leave before the server pauses (0 to disable)',
					category: 'Performance',
					linePrefix: 'pause-when-empty-seconds=',
					valueType: 'number',
					default: '60',
				},
				{
					name: 'Simulation distance',
					desc: 'The distance in chunks from the player in which the world is ticked',
					category: 'Performance',
					linePrefix: 'simulation-distance=',
					valueType: 'number',
					default: '10',
				},
				{
					name: 'Sync chunk writes',
					desc: 'Whether to synchronize chunk writes to disk',
					category: 'Performance',
					linePrefix: 'sync-chunk-writes=',
					valueType: 'boolean',
					default: 'true',
				},
				{
					name: 'Use native transport',
					desc: 'Whether to use the optimized native transport layer on Linux',
					category: 'Performance',
					linePrefix: 'use-native-transport=',
					valueType: 'boolean',
					default: 'true',
				},
				{
					name: 'View distance',
					desc: 'The distance in chunks that the server sends to the client',
					category: 'Performance',
					linePrefix: 'view-distance=',
					valueType: 'number',
					default: '10',
				},
				{
					name: 'Region file compression',
					desc: 'The compression algorithm used for region files',
					category: 'Performance',
					linePrefix: 'region-file-compression=',
					valueType: 'enum',
					enumOptions: ['deflate', 'lz4', 'none'],
					default: 'deflate',
				},
				{
					name: 'Broadcast console to ops',
					desc: 'Whether to send console command output to all online ops',
					category: 'Admin',
					linePrefix: 'broadcast-console-to-ops=',
					valueType: 'boolean',
					default: 'true',
				},
				{
					name: 'Broadcast RCON to ops',
					desc: 'Whether to send RCON command output to all online ops',
					category: 'Admin',
					linePrefix: 'broadcast-rcon-to-ops=',
					valueType: 'boolean',
					default: 'true',
				},
				{
					name: 'Enable RCON',
					desc: 'Whether to enable remote console access',
					category: 'Admin',
					linePrefix: 'enable-rcon=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'RCON port',
					desc: 'The port for the RCON listener',
					category: 'Admin',
					linePrefix: 'rcon.port=',
					valueType: 'number',
					default: '25575',
				},
				{
					name: 'RCON password',
					desc: 'The password required for RCON access',
					category: 'Admin',
					linePrefix: 'rcon.password=',
					valueType: 'string',
					default: '',
				},
				{
					name: 'Enforce whitelist',
					desc: 'Whether to kick players not on the whitelist when it is reloaded',
					category: 'Admin',
					linePrefix: 'enforce-whitelist=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'White list',
					desc: 'Whether only players on the whitelist can join the server',
					category: 'Admin',
					linePrefix: 'white-list=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Function permission level',
					desc: 'The default permission level for functions (1–4)',
					category: 'Admin',
					linePrefix: 'function-permission-level=',
					valueType: 'number',
					default: '2',
				},
				{
					name: 'Op permission level',
					desc: 'The default permission level for operators (1–4)',
					category: 'Admin',
					linePrefix: 'op-permission-level=',
					valueType: 'number',
					default: '4',
				},
				{
					name: 'Log IPs',
					desc: 'Whether to log player IP addresses to the server log',
					category: 'Admin',
					linePrefix: 'log-ips=',
					valueType: 'boolean',
					default: 'true',
				},
				{
					name: 'Require resource pack',
					desc: 'Whether players must accept the server resource pack to join',
					category: 'Customization',
					linePrefix: 'require-resource-pack=',
					valueType: 'boolean',
					default: 'false',
				},
				{
					name: 'Resource pack',
					desc: 'The URL to the server resource pack',
					category: 'Customization',
					linePrefix: 'resource-pack=',
					valueType: 'string',
					default: '',
				},
				{
					name: 'Resource pack ID',
					desc: 'The UUID of the resource pack',
					category: 'Customization',
					linePrefix: 'resource-pack-id=',
					valueType: 'string',
					default: '',
				},
				{
					name: 'Resource pack prompt',
					desc: 'The custom message shown when prompting the player to download the resource pack',
					category: 'Customization',
					linePrefix: 'resource-pack-prompt=',
					valueType: 'string',
					default: '',
				},
				{
					name: 'Resource pack SHA-1',
					desc: 'The SHA-1 hash of the resource pack for verification',
					category: 'Customization',
					linePrefix: 'resource-pack-sha1=',
					valueType: 'string',
					default: '',
				},
				{
					name: 'Initial enabled packs',
					desc: 'A comma-separated list of data packs to enable by default',
					category: 'Customization',
					linePrefix: 'initial-enabled-packs=',
					valueType: 'string',
					default: 'vanilla',
				},
				{
					name: 'Initial disabled packs',
					desc: 'A comma-separated list of data packs to disable by default',
					category: 'Customization',
					linePrefix: 'initial-disabled-packs=',
					valueType: 'string',
					default: '',
				},
			],
		},
	],
};

// ============================================================
// Lookup Functions
// ============================================================

export function getGameTypeDetails(gameType: GameType): GameTypeDetails {
	return GAME_TYPE_DETAILS[gameType];
}

export function getVariantDetails<T extends GameType>(
	gameType: T,
	variant: GameVariantMap[T],
): VariantDetails {
	return VARIANT_DETAILS[gameType][variant as string];
}

export function getModProviders(gameType: GameType): ModProviderDetails[] {
	return MOD_PROVIDER_DETAILS[gameType] ?? [];
}

export function getConfigurations(gameType: GameType): ConfigurationFile[] {
	return CONFIGURATIONS[gameType] ?? [];
}
