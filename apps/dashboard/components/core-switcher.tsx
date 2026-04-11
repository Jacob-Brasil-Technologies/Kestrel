'use client';

import * as React from 'react';
import { AddCoreDialog } from '@/components/add-core-dialog';
import { useCores } from '@/lib/core/core-provider';
import type { CoreConnection } from '@/lib/core/store';

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

function CoreIcon({ core, size = 'lg' }: { core: CoreConnection; size?: 'lg' | 'sm' }) {
	const iconUrl = core.icon ? `${core.url}/uploads/${core.icon}` : null;

	if (size === 'lg') {
		return (
			<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
				{iconUrl ? (
					<img src={iconUrl} alt={core.name} className="size-full object-cover" />
				) : (
					<ServerIcon className="size-4" />
				)}
			</div>
		);
	}

	return (
		<div className="flex size-6 items-center justify-center rounded-md border overflow-hidden">
			{iconUrl ? (
				<img src={iconUrl} alt={core.name} className="size-full object-cover" />
			) : (
				<ServerIcon className="size-3" />
			)}
		</div>
	);
}

export function CoreSwitcher() {
	const { isMobile } = useSidebar();
	const { cores, activeCore, setActiveCore } = useCores();
	const [addDialogOpen, setAddDialogOpen] = React.useState(false);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={<SidebarMenuButton size="lg" className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground" />}
					>
						{activeCore ? (
							<CoreIcon core={activeCore} size="lg" />
						) : (
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<ServerIcon className="size-4" />
							</div>
						)}
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{activeCore?.name ?? 'No Core'}</span>
							<span className="truncate text-xs text-muted-foreground">{activeCore ? 'Connected' : 'Not connected'}</span>
						</div>
						<ChevronsUpDownIcon className="ml-auto" />
					</DropdownMenuTrigger>
					<DropdownMenuContent className="min-w-56 rounded-lg" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
						{cores.length > 0 && (
							<DropdownMenuGroup>
								<DropdownMenuLabel className="text-xs text-muted-foreground">Cores</DropdownMenuLabel>
								{cores.map((core) => (
									<DropdownMenuItem key={core.id} onClick={() => setActiveCore(core.id)} className="gap-2 p-2">
										<CoreIcon core={core} size="sm" />
										{core.name}
									</DropdownMenuItem>
								))}
							</DropdownMenuGroup>
						)}
						{cores.length > 0 && <DropdownMenuSeparator />}
						<DropdownMenuGroup>
							<DropdownMenuItem className="gap-2 p-2" onClick={() => setAddDialogOpen(true)}>
								<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
									<PlusIcon className="size-4" />
								</div>
								<div className="font-medium text-muted-foreground">Add core</div>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
			<AddCoreDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
		</SidebarMenu>
	);
}
