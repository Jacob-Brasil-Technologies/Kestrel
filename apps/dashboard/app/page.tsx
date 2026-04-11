'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { ServerConsole } from '@/components/server-console';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { InstanceProvider, useInstance } from '@/lib/instance/instance-provider';
import { PlayIcon, SquareIcon, RotateCcwIcon, LoaderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const START_SERVER = gql`
	mutation StartServer($instanceId: ID!) {
		startServer(instanceId: $instanceId)
	}
`;

const STOP_SERVER = gql`
	mutation StopServer($instanceId: ID!) {
		stopServer(instanceId: $instanceId)
	}
`;

const RESTART_SERVER = gql`
	mutation RestartServer($instanceId: ID!) {
		restartServer(instanceId: $instanceId)
	}
`;

function ServerControls() {
	const { activeInstance } = useInstance();
	const [startServer, { loading: starting }] = useMutation(START_SERVER);
	const [stopServer, { loading: stopping }] = useMutation(STOP_SERVER);
	const [restartServer, { loading: restarting }] = useMutation(RESTART_SERVER);

	if (!activeInstance) return null;

	const { status, id: instanceId } = activeInstance;
	const isRunning = status === 'RUNNING';
	const isStopped = status === 'STOPPED';
	const isTransitioning = status === 'STARTING' || status === 'STOPPING';

	return (
		<div className="flex items-center gap-1">
			{(isStopped || status === 'CRASHED') && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => startServer({ variables: { instanceId } })}
					disabled={starting}
					className="text-green-500 hover:text-green-400"
				>
					{starting ? <LoaderIcon className="mr-1 size-3.5 animate-spin" /> : <PlayIcon className="mr-1 size-3.5" />}
					Start
				</Button>
			)}
			{isRunning && (
				<>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => stopServer({ variables: { instanceId } })}
						disabled={stopping}
						className="text-red-500 hover:text-red-400"
					>
						{stopping ? <LoaderIcon className="mr-1 size-3.5 animate-spin" /> : <SquareIcon className="mr-1 size-3.5" />}
						Stop
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => restartServer({ variables: { instanceId } })}
						disabled={restarting}
						className="text-yellow-500 hover:text-yellow-400"
					>
						{restarting ? <LoaderIcon className="mr-1 size-3.5 animate-spin" /> : <RotateCcwIcon className="mr-1 size-3.5" />}
						Restart
					</Button>
				</>
			)}
			{isTransitioning && (
				<div className="flex items-center gap-1.5 text-sm text-muted-foreground px-2">
					<LoaderIcon className="size-3.5 animate-spin" />
					{status === 'STARTING' ? 'Starting...' : 'Stopping...'}
				</div>
			)}
		</div>
	);
}

function ViewHeader() {
	const { activeView, activeInstance } = useInstance();

	const titles: Record<string, string> = {
		overview: 'Overview',
		console: 'Console',
		files: 'Files',
		settings: 'Settings',
	};

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
				<div className="flex items-center gap-3">
					<h1 className="text-sm font-medium">{activeInstance?.name ?? 'Kestrel'}</h1>
					<span className="text-xs text-muted-foreground">/ {titles[activeView] ?? activeView}</span>
				</div>
			</div>
			<div className="ml-auto pr-4">
				{activeView === 'console' && <ServerControls />}
			</div>
		</header>
	);
}

function MainContent() {
	const { activeView } = useInstance();

	switch (activeView) {
		case 'console':
			return <ServerConsole />;
		case 'overview':
			return (
				<div className="flex flex-1 items-center justify-center text-muted-foreground">
					<p className="text-sm">Overview coming soon.</p>
				</div>
			);
		case 'settings':
			return (
				<div className="flex flex-1 items-center justify-center text-muted-foreground">
					<p className="text-sm">Settings coming soon.</p>
				</div>
			);
		default:
			return null;
	}
}

export default function Page() {
	return (
		<InstanceProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className="overflow-hidden">
					<ViewHeader />
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0">
						<MainContent />
					</div>
				</SidebarInset>
			</SidebarProvider>
		</InstanceProvider>
	);
}
