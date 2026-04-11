'use client';

import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCores } from '@/lib/core/core-provider';
import { fetchCoreInfo, submitSetupCode, createAdmin, login, updateCore, buildCoreConnection, type CoreInfo } from '@/lib/core/api';
import { ServerIcon, LogInIcon, KeyRoundIcon, LoaderIcon, UploadIcon } from 'lucide-react';
import { SetupCodeInput } from '@/components/setup-code-input';

type Step = 'choose' | 'connect' | 'setup-code' | 'create-admin' | 'customize' | 'login' | 'done';

interface StepState {
	step: Step;
	mode: 'setup' | 'login' | null;
	graphqlUrl: string;
	coreInfo: CoreInfo | null;
	setupToken: string;
	error: string;
	loading: boolean;
}

const initial: StepState = {
	step: 'connect',
	mode: null,
	graphqlUrl: '',
	coreInfo: null,
	setupToken: '',
	error: '',
	loading: false,
};

export function AddCoreDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const { addCore, updateCoreName } = useCores();
	const [state, setState] = useState<StepState>(initial);
	const [protocol, setProtocol] = useState<'http' | 'https'>('http');
	const [hostInput, setHostInput] = useState('');
	const [portInput, setPortInput] = useState('');
	const [codeInput, setCodeInput] = useState('');
	const [usernameInput, setUsernameInput] = useState('');
	const [passwordInput, setPasswordInput] = useState('');
	const [coreNameInput, setCoreNameInput] = useState('');
	const [iconFile, setIconFile] = useState<File | null>(null);
	const [iconPreview, setIconPreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [connectedCoreId, setConnectedCoreId] = useState<string | null>(null);

	function reset() {
		setState(initial);
		setProtocol('http');
		setHostInput('');
		setPortInput('');
		setCodeInput('');
		setUsernameInput('');
		setPasswordInput('');
		setCoreNameInput('');
		setIconFile(null);
		setIconPreview(null);
		setConnectedCoreId(null);
	}

	function handleOpenChange(open: boolean) {
		if (!open) reset();
		onOpenChange(open);
	}

	function setError(error: string) {
		setState((s) => ({ ...s, error, loading: false }));
	}

	function buildUrl(): string {
		const port = portInput.trim();
		const host = hostInput.trim();
		return port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
	}

	async function handleConnect() {
		setState((s) => ({ ...s, loading: true, error: '' }));
		try {
			const { url, config } = await fetchCoreInfo(buildUrl());
			setState((s) => ({ ...s, graphqlUrl: url, coreInfo: config, loading: false }));

			if (!config.isSetup) {
				setState((s) => ({ ...s, step: 'setup-code', mode: 'setup' }));
			} else {
				setState((s) => ({ ...s, step: 'login', mode: 'login' }));
			}
		} catch (e: any) {
			setError(e.message || 'Could not connect to core');
		}
	}

	async function handleSetupCode(code?: string) {
		const setupCode = code ?? codeInput;
		setState((s) => ({ ...s, loading: true, error: '' }));
		try {
			const result = await submitSetupCode(state.graphqlUrl, setupCode);
			setState((s) => ({
				...s,
				setupToken: result.setupToken,
				coreInfo: result.config,
				step: 'create-admin',
				loading: false,
			}));
		} catch (e: any) {
			setError(e.message || 'Invalid setup code');
		}
	}

	async function handleCreateAdmin() {
		setState((s) => ({ ...s, loading: true, error: '' }));
		try {
			const auth = await createAdmin(state.graphqlUrl, state.setupToken, usernameInput, passwordInput);
			const core = buildCoreConnection(state.graphqlUrl, state.coreInfo?.name ?? 'Kestrel Core', auth, state.coreInfo?.icon);
			addCore(core);
			setConnectedCoreId(core.id);
			setCoreNameInput(state.coreInfo?.name ?? 'My Kestrel Core');
			setState((s) => ({ ...s, step: 'customize', loading: false }));
		} catch (e: any) {
			setError(e.message || 'Failed to create admin account');
		}
	}

	async function handleLogin() {
		setState((s) => ({ ...s, loading: true, error: '' }));
		try {
			const auth = await login(state.graphqlUrl, usernameInput, passwordInput);
			const core = buildCoreConnection(state.graphqlUrl, state.coreInfo?.name ?? 'Kestrel Core', auth, state.coreInfo?.icon);
			addCore(core);
			setState((s) => ({ ...s, step: 'done', loading: false }));
		} catch (e: any) {
			setError(e.message || 'Invalid username or password');
		}
	}

	function handleIconSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setIconFile(file);
		const reader = new FileReader();
		reader.onload = () => setIconPreview(reader.result as string);
		reader.readAsDataURL(file);
	}

	async function handleCustomize() {
		if (!connectedCoreId) return;
		const cores = JSON.parse(localStorage.getItem('kestrel_cores') ?? '[]');
		const core = cores.find((c: any) => c.id === connectedCoreId);
		if (!core) return;

		const hasChanges = coreNameInput.trim() !== (state.coreInfo?.name ?? '') || iconFile;
		if (hasChanges) {
			setState((s) => ({ ...s, loading: true, error: '' }));
			try {
				const updated = await updateCore(
					state.graphqlUrl,
					core.token,
					coreNameInput.trim() || undefined,
					iconFile ?? undefined,
				);
				updateCoreName(connectedCoreId, updated.name, updated.icon);
			} catch (e: any) {
				setError(e.message || 'Failed to update core');
				return;
			}
		}
		setState((s) => ({ ...s, step: 'done', loading: false }));
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				{state.step === 'connect' && (
					<>
						<DialogHeader>
							<DialogTitle>Add Core</DialogTitle>
							<DialogDescription>Enter the address of the Kestrel Core you want to connect to.</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4">
							<div className="flex gap-2">
								<div className="flex flex-col gap-2">
									<Label>Protocol</Label>
									<Select value={protocol} onValueChange={(v) => setProtocol(v as 'http' | 'https')}>
										<SelectTrigger className="w-[100px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="http">HTTP</SelectItem>
											<SelectItem value="https">HTTPS</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-1 flex-col gap-2">
									<Label htmlFor="core-host">IP Address / Hostname</Label>
									<Input
										id="core-host"
										placeholder="192.168.1.100"
										value={hostInput}
										onChange={(e) => setHostInput(e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2 w-24">
									<Label htmlFor="core-port">Port</Label>
									<Input
										id="core-port"
										placeholder="17773"
										value={portInput}
										onChange={(e) => setPortInput(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
									/>
								</div>
							</div>
							{state.error && <p className="text-sm text-destructive">{state.error}</p>}
						</div>
						<DialogFooter>
							<Button onClick={handleConnect} disabled={!hostInput.trim() || state.loading}>
								{state.loading && <LoaderIcon className="mr-2 size-4 animate-spin" />}
								Connect
							</Button>
						</DialogFooter>
					</>
				)}

				{state.step === 'choose' && (
					<>
						<DialogHeader>
							<DialogTitle>{state.coreInfo?.name ?? 'Kestrel Core'}</DialogTitle>
							<DialogDescription>This core is already set up. How would you like to connect?</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-3">
							<Button
								variant="outline"
								className="h-auto justify-start gap-3 p-4"
								onClick={() => setState((s) => ({ ...s, step: 'setup-code', mode: 'setup' }))}
							>
								<KeyRoundIcon className="size-5 shrink-0" />
								<div className="text-left">
									<div className="font-medium">Setup New Core</div>
									<div className="text-xs text-muted-foreground">I have a setup code for this core</div>
								</div>
							</Button>
							<Button
								variant="outline"
								className="h-auto justify-start gap-3 p-4"
								onClick={() => setState((s) => ({ ...s, step: 'login', mode: 'login' }))}
							>
								<LogInIcon className="size-5 shrink-0" />
								<div className="text-left">
									<div className="font-medium">Login to Existing Core</div>
									<div className="text-xs text-muted-foreground">I already have an account on this core</div>
								</div>
							</Button>
						</div>
					</>
				)}

				{state.step === 'setup-code' && (
					<>
						<DialogHeader>
							<DialogTitle>Enter Setup Code</DialogTitle>
							<DialogDescription>
								Enter the setup code displayed in the Core&apos;s system tray or logs.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4">
							<SetupCodeInput
								value={codeInput}
								onChange={setCodeInput}
								onComplete={(code) => handleSetupCode(code)}
							/>
							{state.error && <p className="text-sm text-destructive">{state.error}</p>}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setState((s) => ({ ...s, step: 'connect', error: '' }))}>
								Back
							</Button>
							<Button onClick={() => handleSetupCode()} disabled={!codeInput.trim() || state.loading}>
								{state.loading && <LoaderIcon className="mr-2 size-4 animate-spin" />}
								Verify
							</Button>
						</DialogFooter>
					</>
				)}

				{state.step === 'create-admin' && (
					<>
						<DialogHeader>
							<DialogTitle>Create Admin Account</DialogTitle>
							<DialogDescription>Set up your admin credentials for this core.</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="admin-username">Username</Label>
								<Input
									id="admin-username"
									placeholder="admin"
									value={usernameInput}
									onChange={(e) => setUsernameInput(e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="admin-password">Password</Label>
								<Input
									id="admin-password"
									type="password"
									value={passwordInput}
									onChange={(e) => setPasswordInput(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleCreateAdmin()}
								/>
							</div>
							{state.error && <p className="text-sm text-destructive">{state.error}</p>}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setState((s) => ({ ...s, step: 'setup-code', error: '' }))}>
								Back
							</Button>
							<Button onClick={handleCreateAdmin} disabled={!usernameInput.trim() || !passwordInput.trim() || state.loading}>
								{state.loading && <LoaderIcon className="mr-2 size-4 animate-spin" />}
								Create Account
							</Button>
						</DialogFooter>
					</>
				)}

				{state.step === 'login' && (
					<>
						<DialogHeader>
							<DialogTitle>Login to {state.coreInfo?.name ?? 'Core'}</DialogTitle>
							<DialogDescription>Enter your credentials to connect.</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="login-username">Username</Label>
								<Input
									id="login-username"
									value={usernameInput}
									onChange={(e) => setUsernameInput(e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="login-password">Password</Label>
								<Input
									id="login-password"
									type="password"
									value={passwordInput}
									onChange={(e) => setPasswordInput(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
								/>
							</div>
							{state.error && <p className="text-sm text-destructive">{state.error}</p>}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setState((s) => ({ ...s, step: 'choose', error: '' }))}>
								Back
							</Button>
							<Button onClick={handleLogin} disabled={!usernameInput.trim() || !passwordInput.trim() || state.loading}>
								{state.loading && <LoaderIcon className="mr-2 size-4 animate-spin" />}
								Login
							</Button>
						</DialogFooter>
					</>
				)}

				{state.step === 'customize' && (
					<>
						<DialogHeader>
							<DialogTitle>Customize Your Core</DialogTitle>
							<DialogDescription>Give your core a name and icon. You can always change these later.</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4">
							<div className="flex flex-col items-center gap-3">
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="group relative flex size-20 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted overflow-hidden"
								>
									{iconPreview ? (
										<img src={iconPreview} alt="Core icon" className="size-full object-cover" />
									) : (
										<UploadIcon className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
									)}
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleIconSelect}
									className="hidden"
								/>
								<p className="text-xs text-muted-foreground">Click to upload an icon</p>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="core-name">Core Name</Label>
								<Input
									id="core-name"
									placeholder="My Kestrel Core"
									value={coreNameInput}
									onChange={(e) => setCoreNameInput(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleCustomize()}
								/>
							</div>
							{state.error && <p className="text-sm text-destructive">{state.error}</p>}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setState((s) => ({ ...s, step: 'done', loading: false }))}>
								Skip
							</Button>
							<Button onClick={handleCustomize} disabled={state.loading}>
								{state.loading && <LoaderIcon className="mr-2 size-4 animate-spin" />}
								Save
							</Button>
						</DialogFooter>
					</>
				)}

				{state.step === 'done' && (
					<>
						<DialogHeader>
							<DialogTitle>Connected!</DialogTitle>
							<DialogDescription>
								You&apos;re now connected to <strong>{coreNameInput.trim() || state.coreInfo?.name || 'Kestrel Core'}</strong>.
							</DialogDescription>
						</DialogHeader>
						<div className="flex items-center justify-center py-6">
							<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
								<ServerIcon className="size-8 text-primary" />
							</div>
						</div>
						<DialogFooter>
							<Button onClick={() => handleOpenChange(false)}>Done</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
