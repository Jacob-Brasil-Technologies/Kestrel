'use client';

import * as React from 'react';
import { useCores } from '@/lib/core/core-provider';
import { useInstance, type InstanceData } from '@/lib/instance/instance-provider';
import { CreateInstanceDialog } from '@/components/create-instance-dialog';
import type { InstanceStatus } from '@/lib/gql/graphql';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { ChevronsUpDownIcon, PlusIcon, ServerIcon } from 'lucide-react';

function statusLabel(status: InstanceStatus): string {
	return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusColor(status: InstanceStatus): string {
	switch (status) {
		case 'RUNNING':
			return 'text-green-500';
		case 'STARTING':
		case 'STOPPING':
			return 'text-yellow-500';
		case 'CRASHED':
			return 'text-red-500';
		default:
			return 'text-muted-foreground';
	}
}

function InstanceIcon({ instance, baseUrl, size = 'lg' }: { instance: InstanceData; baseUrl: string; size?: 'lg' | 'sm' }) {
	const iconUrl = instance.gameInfo.icon ? `${baseUrl}${instance.gameInfo.icon}` : null;
	const cls = size === 'lg' ? 'size-8 rounded-lg' : 'size-6 rounded-md border';

	return (
		<div className={`flex aspect-square items-center justify-center overflow-hidden bg-muted text-sidebar-primary-foreground ${cls}`}>
			{iconUrl ? (
				<img src={iconUrl} alt={instance.gameInfo.name} className={`object-contain ${size === 'lg' ? 'size-5' : 'size-3.5'}`} />
			) : (
				<ServerIcon className={size === 'lg' ? 'size-4' : 'size-3'} />
			)}
		</div>
	);
}

export function InstanceSwitcher() {
	const { isMobile } = useSidebar();
	const { activeCore } = useCores();
	const { instances, activeInstance, setActiveInstanceId, loading } = useInstance();
	const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
	const baseUrl = activeCore?.url ?? '';

	if (!activeCore) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg" disabled>
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
							<ServerIcon className="size-4" />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium text-muted-foreground">No Core Connected</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (loading) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg" disabled>
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
							<ServerIcon className="size-4" />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium text-muted-foreground">Loading...</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={<SidebarMenuButton size="lg" className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground" />}
					>
						{activeInstance ? (
							<>
								<InstanceIcon instance={activeInstance} baseUrl={baseUrl} size="lg" />
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{activeInstance.name}</span>
									<span className={`truncate text-xs ${statusColor(activeInstance.status)}`}>{statusLabel(activeInstance.status)}</span>
								</div>
							</>
						) : (
							<>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<ServerIcon className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium text-muted-foreground">No Instances</span>
								</div>
							</>
						)}
						<ChevronsUpDownIcon className="ml-auto" />
					</DropdownMenuTrigger>
					<DropdownMenuContent className="min-w-56 rounded-lg" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
						{instances.length > 0 && (
							<DropdownMenuGroup>
								<DropdownMenuLabel className="text-xs text-muted-foreground">Instances</DropdownMenuLabel>
								{instances.map((instance) => (
									<DropdownMenuItem key={instance.id} onClick={() => setActiveInstanceId(instance.id)} className="gap-2 p-2">
										<InstanceIcon instance={instance} baseUrl={baseUrl} size="sm" />
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-medium">{instance.name}</span>
											<span className={`truncate text-xs ${statusColor(instance.status)}`}>{statusLabel(instance.status)}</span>
										</div>
									</DropdownMenuItem>
								))}
							</DropdownMenuGroup>
						)}
						{instances.length > 0 && <DropdownMenuSeparator />}
						<DropdownMenuGroup>
							<DropdownMenuItem className="gap-2 p-2" onClick={() => setCreateDialogOpen(true)}>
								<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
									<PlusIcon className="size-4" />
								</div>
								<div className="font-medium text-muted-foreground">Create instance</div>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
			<CreateInstanceDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
		</SidebarMenu>
	);
}
