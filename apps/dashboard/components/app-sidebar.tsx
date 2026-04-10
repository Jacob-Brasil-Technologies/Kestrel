'use client';

import { CoreSwitcher } from '@/components/core-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

import { NavMain } from '@/components/nav-main';
import { InstanceSwitcher } from '@/components/instance-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import {
	TerminalSquareIcon,
	LayoutDashboardIcon,
	Settings2Icon,
} from 'lucide-react';
import { useInstance, type SidebarView } from '@/lib/instance/instance-provider';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { activeView, setActiveView } = useInstance();

	const navItems: { title: string; view: SidebarView; icon: React.ReactNode; isActive: boolean }[] = [
		{
			title: 'Overview',
			view: 'overview',
			icon: <LayoutDashboardIcon />,
			isActive: activeView === 'overview',
		},
		{
			title: 'Console',
			view: 'console',
			icon: <TerminalSquareIcon />,
			isActive: activeView === 'console',
		},
		{
			title: 'Settings',
			view: 'settings',
			icon: <Settings2Icon />,
			isActive: activeView === 'settings',
		},
	];

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<InstanceSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navItems} onNavigate={(view) => setActiveView(view)} />
			</SidebarContent>
			<SidebarFooter>
				<ThemeToggle />
				<CoreSwitcher />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
