'use client';

import { useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useCores } from '@/lib/core/core-provider';
import { GameType, GameVariant, RuntimeType, RuntimeFlag } from '@/lib/gql/graphql';
import { GET_INSTANCES } from '@/lib/instance/instance-provider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderIcon, ServerIcon, ArrowLeftIcon, SearchIcon, MonitorIcon } from 'lucide-react';

const PLATFORM_LABELS: Record<string, string> = {
	linux: 'Linux',
	windows: 'Windows',
	darwin: 'macOS',
};

const GET_GAMES = gql`
	query GetGames {
		getGames {
			name
			developer
			icon
			developerIcon
			type
			runtime
			supportedPlatforms
			userConfig {
				configType
				default
			}
		}
	}
`;

const GET_VARIANTS = gql`
	query GetVariants($for: GameType!) {
		getVariants(for: $for) {
			name
			description
			icon
			variant
		}
	}
`;

const GET_VARIANT_VERSIONS = gql`
	query GetVariantVersions($gameType: GameType!, $variant: GameVariant!) {
		getVariantVersions(gameType: $gameType, variant: $variant)
	}
`;

const CREATE_INSTANCE = gql`
	mutation CreateInstance($input: CreateInstanceInput!) {
		createInstance(input: $input) {
			id
			name
			status
		}
	}
`;

const GET_SYSTEM_STATS = gql`
	query GetSystemStats {
		systemStats {
			platform
		}
	}
`;

const GET_AVAILABLE_RUNTIMES = gql`
	query GetAvailableRuntimes($type: RuntimeType!) {
		availableRuntimes(type: $type) {
			version
			flags
		}
	}
`;

interface UserConfigEntry {
	configType: string;
	default: string;
}

interface GameInfo {
	name: string;
	developer: string;
	icon: string;
	developerIcon: string;
	type: GameType;
	runtime: RuntimeType;
	supportedPlatforms: string[];
	userConfig: UserConfigEntry[];
}

interface VariantInfo {
	name: string;
	description: string;
	icon: string;
	variant: GameVariant;
}

interface AvailableRuntime {
	version: string;
	flags: RuntimeFlag[];
}

type Step = 'game' | 'variant' | 'configure';

export function CreateInstanceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const { activeCore } = useCores();
	const baseUrl = activeCore?.url ?? '';

	const [step, setStep] = useState<Step>('game');
	const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<VariantInfo | null>(null);
	const [name, setName] = useState('');
	const [variantVersion, setVariantVersion] = useState('');
	const [runtimeVersion, setRuntimeVersion] = useState('');
	const [minMemory, setMinMemory] = useState('1024');
	const [maxMemory, setMaxMemory] = useState('2048');
	const [port, setPort] = useState('');
	const [error, setError] = useState('');
	const [gameSearch, setGameSearch] = useState('');
	const [variantSearch, setVariantSearch] = useState('');

	const { data: gamesData, loading: gamesLoading } = useQuery<{ getGames: GameInfo[] }>(GET_GAMES, {
		skip: !activeCore,
	});

	const { data: statsData } = useQuery<{ systemStats: { platform: string } }>(GET_SYSTEM_STATS, {
		skip: !activeCore,
	});
	const corePlatform = statsData?.systemStats?.platform ?? '';

	const { data: variantsData, loading: variantsLoading } = useQuery<{ getVariants: VariantInfo[] }>(GET_VARIANTS, {
		variables: { for: selectedGame?.type },
		skip: !selectedGame,
	});

	const { data: versionsData, loading: versionsLoading } = useQuery<{ getVariantVersions: string[] }>(GET_VARIANT_VERSIONS, {
		variables: { gameType: selectedGame?.type, variant: selectedVariant?.variant },
		skip: !selectedGame || !selectedVariant,
	});

	const needsRuntimeSelection = selectedGame?.runtime === RuntimeType.Java;
	const { data: runtimesData, loading: runtimesLoading } = useQuery<{ availableRuntimes: AvailableRuntime[] }>(GET_AVAILABLE_RUNTIMES, {
		variables: { type: selectedGame?.runtime },
		skip: !selectedGame || !needsRuntimeSelection,
	});

	const availableRuntimes = runtimesData?.availableRuntimes ?? [];

	const [createInstance, { loading: creating }] = useMutation(CREATE_INSTANCE, {
		refetchQueries: [{ query: GET_INSTANCES }],
	});

	function reset() {
		setStep('game');
		setSelectedGame(null);
		setSelectedVariant(null);
		setName('');
		setVariantVersion('');
		setRuntimeVersion('');
		setMinMemory('1024');
		setMaxMemory('2048');
		setPort('');
		setError('');
		setGameSearch('');
		setVariantSearch('');
	}

	function handleOpenChange(open: boolean) {
		if (!open) reset();
		onOpenChange(open);
	}

	function handleSelectGame(game: GameInfo) {
		setSelectedGame(game);
		setName(`My ${game.name} Server`);

		// Apply defaults from userConfig
		const portCfg = game.userConfig.find(c => c.configType === 'port');
		const minMemCfg = game.userConfig.find(c => c.configType === 'minMemory');
		const maxMemCfg = game.userConfig.find(c => c.configType === 'maxMemory');
		setPort(portCfg?.default ?? '');
		setMinMemory(minMemCfg ? '1024' : '');
		setMaxMemory(maxMemCfg ? '2048' : '');

		// We'll check variant count after the query loads
		setStep('variant');
	}

	function handleSelectVariant(variant: VariantInfo) {
		setSelectedVariant(variant);
		setVariantVersion('');
		setStep('configure');
	}

	// Auto-select vanilla and skip variant step if only one variant
	const variants = variantsData?.getVariants ?? [];
	if (step === 'variant' && !variantsLoading && variants.length === 1 && !selectedVariant) {
		// Only vanilla — skip to configure
		setSelectedVariant(variants[0]);
		setVariantVersion('');
		setStep('configure');
	}

	const versions = versionsData?.getVariantVersions ?? [];

	// Auto-select the recommended runtime version when data loads
	if (needsRuntimeSelection && availableRuntimes.length > 0 && !runtimeVersion) {
		const recommended = availableRuntimes.find((r) => r.flags.includes(RuntimeFlag.Recommended))
			?? availableRuntimes.find((r) => r.flags.includes(RuntimeFlag.Lts))
			?? availableRuntimes[0];
		if (recommended) {
			setRuntimeVersion(recommended.version);
		}
	}

	async function handleCreate() {
		setError('');
		try {
			const hasMinMem = selectedGame!.userConfig.some(c => c.configType === 'minMemory');
			const hasMaxMem = selectedGame!.userConfig.some(c => c.configType === 'maxMemory');
			await createInstance({
				variables: {
					input: {
						name,
						gameType: selectedGame!.type,
						variant: selectedVariant!.variant,
						variantVersion,
						runtimeVersion,
						...(hasMinMem && minMemory ? { minMemory: parseInt(minMemory) } : {}),
						...(hasMaxMem && maxMemory ? { maxMemory: parseInt(maxMemory) } : {}),
						port: port ? parseInt(port) : undefined,
					},
				},
			});
			handleOpenChange(false);
		} catch (e: any) {
			setError(e.message || 'Failed to create instance');
		}
	}

	function handleBack() {
		setError('');
		if (step === 'configure') {
			if (variants.length > 1) {
				setSelectedVariant(null);
				setVariantSearch('');
				setStep('variant');
			} else {
				setSelectedGame(null);
				setSelectedVariant(null);
				setGameSearch('');
				setStep('game');
			}
		} else if (step === 'variant') {
			setSelectedGame(null);
			setSelectedVariant(null);
			setGameSearch('');
			setStep('game');
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-xl">
				{step === 'game' && (
					<>
						<DialogHeader>
							<DialogTitle>Create Instance</DialogTitle>
							<DialogDescription>Select a game to get started.</DialogDescription>
						</DialogHeader>
						<div className="relative">
							<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search games..."
								value={gameSearch}
								onChange={(e) => setGameSearch(e.target.value)}
								className="pl-9"
							/>
						</div>
						<div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
							{gamesLoading && (
								<div className="col-span-3 flex items-center justify-center py-8">
									<LoaderIcon className="size-6 animate-spin text-muted-foreground" />
								</div>
							)}
							{gamesData?.getGames
								.filter((game) => {
									if (!gameSearch) return true;
									const q = gameSearch.toLowerCase();
									return game.name.toLowerCase().includes(q) || game.developer.toLowerCase().includes(q);
								})
								.sort((a, b) => {
									const aSupported = !corePlatform || a.supportedPlatforms.includes(corePlatform);
									const bSupported = !corePlatform || b.supportedPlatforms.includes(corePlatform);
									if (aSupported !== bSupported) return aSupported ? -1 : 1;
									return a.name.localeCompare(b.name);
								})
								.map((game) => {
								const isSupported = !corePlatform || game.supportedPlatforms.includes(corePlatform);
								return (
								<Button
									key={game.type}
									variant="outline"
									className={`h-auto flex-col items-start gap-2 p-4 min-h-40 overflow-hidden whitespace-normal ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
									onClick={() => isSupported && handleSelectGame(game)}
									disabled={!isSupported}
								>
									<div className="flex size-12 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-muted">
										<img src={`${baseUrl}${game.icon}`} alt={game.name} className="size-8 object-contain" />
									</div>
									<div className="text-left mt-auto min-w-0 w-full">
										<div className="text-sm font-medium leading-tight">{game.name}</div>
										<div className="flex items-start gap-1 text-[11px] text-muted-foreground">
											<img src={`${baseUrl}${game.developerIcon}`} alt={game.developer} className="size-3 shrink-0 object-contain rounded-sm mt-0.5" />
											<span>{game.developer}</span>
										</div>
										<div className="flex flex-wrap gap-1 mt-1">
											{game.supportedPlatforms.map((p) => (
												<span
													key={p}
													className={`inline-flex items-center rounded px-1 py-0.5 text-[9px] font-medium leading-none ${
														p === corePlatform
															? 'bg-primary/15 text-primary'
															: 'bg-muted text-muted-foreground'
													}`}
												>
													{PLATFORM_LABELS[p] ?? p}
												</span>
											))}
										</div>
									</div>
								</Button>
								);
							})}
						</div>
					</>
				)}

				{step === 'variant' && (
					<>
						<DialogHeader>
							<DialogTitle>Select Variant</DialogTitle>
							<DialogDescription>
								Choose the server software for your {selectedGame?.name} server.
							</DialogDescription>
						</DialogHeader>
						<div className="relative">
							<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search variants..."
								value={variantSearch}
								onChange={(e) => setVariantSearch(e.target.value)}
								className="pl-9"
							/>
						</div>
						<div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
							{variantsLoading && (
								<div className="col-span-3 flex items-center justify-center py-8">
									<LoaderIcon className="size-6 animate-spin text-muted-foreground" />
								</div>
							)}
							{variants
								.filter((variant) => {
									if (!variantSearch) return true;
									const q = variantSearch.toLowerCase();
									return variant.name.toLowerCase().includes(q) || (variant.description?.toLowerCase().includes(q) ?? false);
								})
								.map((variant) => (
								<Button
									key={variant.variant}
									variant="outline"
									className="h-auto flex-col items-start gap-2 p-4 min-h-40 overflow-hidden whitespace-normal"
									onClick={() => handleSelectVariant(variant)}
								>
									<div className="flex size-12 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-muted">
										<img src={`${baseUrl}${variant.icon}`} alt={variant.name} className="size-8 object-contain" />
									</div>
									<div className="text-left mt-auto min-w-0 w-full">
										<div className="text-sm font-medium leading-tight">{variant.name}</div>
										<div className="text-[11px] text-muted-foreground">{variant.description}</div>
									</div>
								</Button>
							))}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={handleBack}>
								<ArrowLeftIcon className="mr-2 size-4" />
								Back
							</Button>
						</DialogFooter>
					</>
				)}

				{step === 'configure' && (
					<>
						<DialogHeader>
							<DialogTitle>Configure Instance</DialogTitle>
							<DialogDescription>
								Set up your {selectedGame?.name} {selectedVariant?.name !== 'Vanilla' ? selectedVariant?.name + ' ' : ''}server.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
							<div className="flex flex-col gap-2">
								<Label htmlFor="instance-name">Server Name</Label>
								<Input
									id="instance-name"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label>Game Version</Label>
								{versionsLoading ? (
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<LoaderIcon className="size-4 animate-spin" />
										Loading versions...
									</div>
								) : (
									<Select value={variantVersion} onValueChange={(v) => setVariantVersion(v ?? '')}>
										<SelectTrigger>
											<SelectValue placeholder="Select a version" />
										</SelectTrigger>
										<SelectContent className="max-h-60">
											{versions.map((v) => (
												<SelectItem key={v} value={v}>
													{v}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>

							{needsRuntimeSelection && (
								<div className="flex flex-col gap-2">
									<Label>Runtime Version</Label>
									{runtimesLoading ? (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<LoaderIcon className="size-4 animate-spin" />
											Loading runtime versions...
										</div>
									) : (
										<Select value={runtimeVersion} onValueChange={(v) => setRuntimeVersion(v ?? '')}>
											<SelectTrigger>
												<SelectValue placeholder="Select a runtime version" />
											</SelectTrigger>
											<SelectContent className="max-h-60">
												{availableRuntimes.map((r) => (
													<SelectItem key={r.version} value={r.version}>
														<span>Java {r.version}</span>
														{r.flags.map((f) => (
															<span
																key={f}
																className="ml-1.5 inline-flex items-center rounded px-1 py-0.5 text-[9px] font-medium leading-none bg-primary/15 text-primary"
															>
																{f}
															</span>
														))}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								</div>
							)}

							{selectedGame?.userConfig.some(c => c.configType === 'minMemory' || c.configType === 'maxMemory') && (
							<div className="flex gap-3">
								{selectedGame?.userConfig.some(c => c.configType === 'minMemory') && (
								<div className="flex flex-1 flex-col gap-2">
									<Label htmlFor="min-memory">Min Memory (MB)</Label>
									<Input
										id="min-memory"
										type="number"
										value={minMemory}
										onChange={(e) => setMinMemory(e.target.value)}
									/>
								</div>
								)}
								{selectedGame?.userConfig.some(c => c.configType === 'maxMemory') && (
								<div className="flex flex-1 flex-col gap-2">
									<Label htmlFor="max-memory">Max Memory (MB)</Label>
									<Input
										id="max-memory"
										type="number"
										value={maxMemory}
										onChange={(e) => setMaxMemory(e.target.value)}
									/>
								</div>
								)}
							</div>
							)}

							{selectedGame?.userConfig.some(c => c.configType === 'port') && (
							<div className="flex flex-col gap-2">
								<Label htmlFor="port">Port</Label>
								<Input
									id="port"
									type="number"
									placeholder={selectedGame?.userConfig.find(c => c.configType === 'port')?.default ?? ''}
									value={port}
									onChange={(e) => setPort(e.target.value)}
								/>
							</div>
							)}

							{error && <p className="text-sm text-destructive">{error}</p>}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={handleBack}>
								<ArrowLeftIcon className="mr-2 size-4" />
								Back
							</Button>
							<Button
								onClick={handleCreate}
								disabled={!name.trim() || !variantVersion || (needsRuntimeSelection && !runtimeVersion) || creating}
							>
								{creating && <LoaderIcon className="mr-2 size-4 animate-spin" />}
								Create Server
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
