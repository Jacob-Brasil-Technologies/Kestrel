import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Types for the JSON schema
// ---------------------------------------------------------------------------

interface UserConfig {
	configType: string;
	default?: string;
}

interface GameTypeJson {
	runtime: string;
	supportedPlatforms: string[];
	args?: { arg: string; config?: UserConfig }[];
	details: {
		name: string;
		developer: string;
		icon: string;
		developerIcon: string;
	};
	variants: {
		name: string;
		desc: string;
		icon?: string;
	}[];
	configurations?: {
		filePath: string;
		lines: {
			name: string;
			desc: string;
			category: string;
			linePrefix: string;
			valueType: string;
			enumOptions?: string[];
			default?: string;
			config?: UserConfig;
		}[];
	}[];
	modProviders?: {
		name: string;
		desc: string;
		icon: string;
	}[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const GAMES_DIR = join(TYPES_DIR, 'games');

function toEnumValue(name: string): string {
	return name.charAt(0).toLowerCase() + name.slice(1);
}

function escapeString(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function indent(level: number): string {
	return '\t'.repeat(level);
}

// ---------------------------------------------------------------------------
// Load all game-type JSON files
// ---------------------------------------------------------------------------

const jsonFiles = readdirSync(GAMES_DIR)
	.filter((f) => f.endsWith('.game-type.json'))
	.sort();

const games: { slug: string; data: GameTypeJson }[] = jsonFiles.map((file) => ({
	slug: basename(file, '.game-type.json'),
	data: JSON.parse(readFileSync(join(GAMES_DIR, file), 'utf-8')) as GameTypeJson,
}));

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

const lines: string[] = [];

function emit(line = '') {
	lines.push(line);
}

// Header
emit('// AUTO-GENERATED FILE — DO NOT EDIT');
emit('// Generated from *.game-type.json files. Run `pnpm generate` to regenerate.');
emit();

// ---- Interfaces ---------------------------------------------------------

emit('// ============================================================');
emit('// Interfaces');
emit('// ============================================================');
emit();

emit("export type UserConfigType = 'port' | 'minMemory' | 'maxMemory';");
emit();

emit('export interface UserConfigEntry {');
emit('\tconfigType: UserConfigType;');
emit('\tdefault: string;');
emit('}');
emit();

emit('export interface GameTypeDetails {');
emit('\tname: string;');
emit('\tdeveloper: string;');
emit('\ticon: string;');
emit('\tdeveloperIcon: string;');
emit('\truntime: RuntimeType;');
emit('\targs: string[];');
emit('\tsupportedPlatforms: string[];');
emit('\tuserConfig: UserConfigEntry[];');
emit('}');
emit();

emit('export interface VariantDetails {');
emit('\tname: string;');
emit('\tdesc: string;');
emit('\ticon: string;');
emit('}');
emit();

emit('export interface ModProviderDetails {');
emit('\tname: string;');
emit('\tdesc: string;');
emit('\ticon: string;');
emit('}');
emit();

emit("export type ConfigValueType = 'string' | 'number' | 'boolean' | 'enum';");
emit();

emit('export interface ConfigurationLine {');
emit('\tname: string;');
emit('\tdesc: string;');
emit("\tcategory: 'Networking' | 'World' | 'Server' | 'Gameplay' | 'Performance' | 'Admin' | 'Other' | 'Customization';");
emit('\tlinePrefix: string;');
emit('\tvalueType: ConfigValueType;');
emit('\tenumOptions?: string[];');
emit('\tdefault?: string;');
emit('\tconfig?: UserConfigEntry;');
emit('}');
emit();

emit('export interface ConfigurationFile {');
emit('\tfilePath: string;');
emit('\tlines: ConfigurationLine[];');
emit('}');
emit();

// ---- Runtime enum -------------------------------------------------------

emit('// ============================================================');
emit('// Enums');
emit('// ============================================================');
emit();

const runtimeValues = [...new Set(games.map((g) => g.data.runtime))].sort();

emit('export enum RuntimeType {');
for (const runtime of runtimeValues) {
	const enumKey = runtime.charAt(0).toUpperCase() + runtime.slice(1);
	emit(`\t${enumKey} = '${runtime}',`);
}
emit('}');
emit();

// ---- GameType enum ------------------------------------------------------

emit('export enum GameType {');
for (const game of games) {
	emit(`\t${game.data.details.name} = '${toEnumValue(game.data.details.name)}',`);
}
emit('}');
emit();

// ---- Per-game variant enums ---------------------------------------------

for (const game of games) {
	const enumName = `${game.data.details.name}GameVariant`;
	emit(`export enum ${enumName} {`);
	for (const variant of game.data.variants) {
		emit(`\t${variant.name} = '${toEnumValue(variant.name)}',`);
	}
	emit('}');
	emit();
}

// ---- Base GameVariant (Vanilla only) --------------------------------

emit('/** Base variant */');
emit();
const names: string[] = [];
for (const game of games) {
	names.push(`${game.data.details.name}GameVariant`);
}
emit(`export type TGameVariant = ${names.join(' | ')}`);
emit();
emit('export const GameVariant = {');
for (const name of names) {
	emit(`\t...${name},`);
}
emit('};');
emit();

// ---- Per-game mod provider enums ----------------------------------------

const gamesWithMods = games.filter((g) => g.data.modProviders && g.data.modProviders.length > 0);

for (const game of gamesWithMods) {
	const enumName = `${game.data.details.name}ModProvider`;
	emit(`export enum ${enumName} {`);
	for (const provider of game.data.modProviders!) {
		emit(`\t${provider.name} = '${toEnumValue(provider.name)}',`);
	}
	emit('}');
	emit();
}

// ---- Type mapping -------------------------------------------------------

emit('// ============================================================');
emit('// Type Mapping');
emit('// ============================================================');
emit();

emit('export type GameVariantMap = {');
for (const game of games) {
	emit(`\t[GameType.${game.data.details.name}]: ${game.data.details.name}GameVariant;`);
}
emit('};');
emit();

if (gamesWithMods.length > 0) {
	emit('export type GameModProviderMap = {');
	for (const game of gamesWithMods) {
		emit(`\t[GameType.${game.data.details.name}]: ${game.data.details.name}ModProvider;`);
	}
	emit('};');
	emit();
}

// ---- Data stores --------------------------------------------------------

emit('// ============================================================');
emit('// Data');
emit('// ============================================================');
emit();

// Game type details
emit('const GAME_TYPE_DETAILS: Record<GameType, GameTypeDetails> = {');
for (const game of games) {
	const runtimeEnumKey = game.data.runtime.charAt(0).toUpperCase() + game.data.runtime.slice(1);
	// Extract arg template strings from the object format
	const argTemplates = game.data.args ? game.data.args.map((a) => a.arg) : [];
	const argsLiteral = `[${argTemplates.map((a) => `'${escapeString(a)}'`).join(', ')}]`;
	const platformsLiteral = `[${game.data.supportedPlatforms.map((p) => `'${escapeString(p)}'`).join(', ')}]`;

	// Collect userConfig from args and configuration lines (dedup by configType)
	const configMap = new Map<string, { configType: string; default: string }>();
	if (game.data.args) {
		for (const argDef of game.data.args) {
			if (argDef.config) {
				configMap.set(argDef.config.configType, {
					configType: argDef.config.configType,
					default: argDef.config.default ?? '',
				});
			}
		}
	}
	if (game.data.configurations) {
		for (const config of game.data.configurations) {
			for (const line of config.lines) {
				if (line.config && !configMap.has(line.config.configType)) {
					configMap.set(line.config.configType, {
						configType: line.config.configType,
						default: line.config.default ?? line.default ?? '',
					});
				}
			}
		}
	}
	const userConfigEntries = Array.from(configMap.values());

	emit(`\t[GameType.${game.data.details.name}]: {`);
	emit(`\t\tname: '${escapeString(game.data.details.name)}',`);
	emit(`\t\tdeveloper: '${escapeString(game.data.details.developer)}',`);
	emit(`\t\ticon: '${escapeString(game.data.details.icon)}',`);
	emit(`\t\tdeveloperIcon: '${escapeString(game.data.details.developerIcon)}',`);
	emit(`\t\truntime: RuntimeType.${runtimeEnumKey},`);
	emit(`\t\targs: ${argsLiteral},`);
	emit(`\t\tsupportedPlatforms: ${platformsLiteral},`);
	if (userConfigEntries.length === 0) {
		emit(`\t\tuserConfig: [],`);
	} else {
		emit(`\t\tuserConfig: [`);
		for (const entry of userConfigEntries) {
			emit(`\t\t\t{ configType: '${entry.configType}', default: '${escapeString(entry.default)}' },`);
		}
		emit(`\t\t],`);
	}
	emit(`\t},`);
}
emit('};');
emit();

// Variant details — Record<GameType, Record<string, VariantDetails>>
emit('const VARIANT_DETAILS: Record<GameType, Record<string, VariantDetails>> = {');
for (const game of games) {
	const variantEnum = `${game.data.details.name}GameVariant`;
	emit(`\t[GameType.${game.data.details.name}]: {`);
	for (const variant of game.data.variants) {
		const variantIcon = variant.icon ?? game.data.details.icon;
		emit(`\t\t[${variantEnum}.${variant.name}]: {`);
		emit(`\t\t\tname: '${escapeString(variant.name)}',`);
		emit(`\t\t\tdesc: '${escapeString(variant.desc)}',`);
		emit(`\t\t\ticon: '${escapeString(variantIcon)}',`);
		emit(`\t\t},`);
	}
	emit(`\t},`);
}
emit('};');
emit();

// Mod provider details
emit('const MOD_PROVIDER_DETAILS: Partial<Record<GameType, ModProviderDetails[]>> = {');
for (const game of gamesWithMods) {
	emit(`\t[GameType.${game.data.details.name}]: [`);
	for (const provider of game.data.modProviders!) {
		emit(`\t\t{`);
		emit(`\t\t\tname: '${escapeString(provider.name)}',`);
		emit(`\t\t\tdesc: '${escapeString(provider.desc)}',`);
		if (provider.icon) {
			emit(`\t\t\ticon: '${escapeString(provider.icon)}',`);
		}
		emit(`\t\t},`);
	}
	emit(`\t],`);
}
emit('};');
emit();

// Configurations
function emitConfigLine(line: GameTypeJson['configurations'][0]['lines'][0], depth: number) {
	emit(`${indent(depth)}{`);
	emit(`${indent(depth + 1)}name: '${escapeString(line.name)}',`);
	emit(`${indent(depth + 1)}desc: '${escapeString(line.desc)}',`);
	emit(`${indent(depth + 1)}category: '${escapeString(line.category)}',`);
	emit(`${indent(depth + 1)}linePrefix: '${escapeString(line.linePrefix)}',`);
	emit(`${indent(depth + 1)}valueType: '${line.valueType}',`);
	if (line.enumOptions) {
		emit(`${indent(depth + 1)}enumOptions: [${line.enumOptions.map((o) => `'${escapeString(o)}'`).join(', ')}],`);
	}
	if (line.default !== undefined) {
		emit(`${indent(depth + 1)}default: '${escapeString(line.default)}',`);
	}
	if (line.config) {
		emit(`${indent(depth + 1)}config: { configType: '${line.config.configType}', default: '${escapeString(line.config.default ?? line.default ?? '')}' },`);
	}
	emit(`${indent(depth)}},`);
}

emit('const CONFIGURATIONS: Partial<Record<GameType, ConfigurationFile[]>> = {');
for (const game of games) {
	if (!game.data.configurations || game.data.configurations.length === 0) continue;
	emit(`\t[GameType.${game.data.details.name}]: [`);
	for (const config of game.data.configurations) {
		emit(`\t\t{`);
		emit(`\t\t\tfilePath: '${escapeString(config.filePath)}',`);
		emit(`\t\t\tlines: [`);
		for (const line of config.lines) {
			emitConfigLine(line, 4);
		}
		emit(`\t\t\t],`);
		emit(`\t\t},`);
	}
	emit(`\t],`);
}
emit('};');
emit();

// Configurable args — arg templates that have userConfig metadata
emit('const CONFIGURABLE_ARGS: Partial<Record<GameType, string[]>> = {');
for (const game of games) {
	const configurableArgs = (game.data.args ?? []).filter((a) => a.config).map((a) => a.arg);
	if (configurableArgs.length > 0) {
		emit(`\t[GameType.${game.data.details.name}]: [${configurableArgs.map((a) => `'${escapeString(a)}'`).join(', ')}],`);
	}
}
emit('};');
emit();

// ---- Lookup functions ---------------------------------------------------

emit('// ============================================================');
emit('// Lookup Functions');
emit('// ============================================================');
emit();

emit('export function getGameTypeDetails(gameType: GameType): GameTypeDetails {');
emit('\treturn GAME_TYPE_DETAILS[gameType];');
emit('}');
emit();

emit('export function getVariantDetails<T extends GameType>(');
emit('\tgameType: T,');
emit('\tvariant: GameVariantMap[T],');
emit('): VariantDetails {');
emit('\treturn VARIANT_DETAILS[gameType][variant as string];');
emit('}');
emit();

emit('export function getModProviders(gameType: GameType): ModProviderDetails[] {');
emit('\treturn MOD_PROVIDER_DETAILS[gameType] ?? [];');
emit('}');
emit();

emit('export function getConfigurations(gameType: GameType): ConfigurationFile[] {');
emit('\treturn CONFIGURATIONS[gameType] ?? [];');
emit('}');
emit();

emit('/** Returns arg templates that have userConfig metadata (used for merging with provider args) */');
emit('export function getConfigurableArgs(gameType: GameType): string[] {');
emit('\treturn CONFIGURABLE_ARGS[gameType] ?? [];');
emit('}');
emit();

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

const output = lines.join('\n');
const outPath = join(TYPES_DIR, 'src', 'generated.ts');
writeFileSync(outPath, output, 'utf-8');

console.log(`Generated ${outPath} (${games.length} game types, ${lines.length} lines)`);
