'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// If somehow set to system, force dark
		if (theme === 'system') setTheme('dark');
	}, [theme, setTheme]);

	if (!mounted) return null;

	const isDark = theme === 'dark';

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					onClick={() => setTheme(isDark ? 'light' : 'dark')}
					tooltip={isDark ? 'Dark Mode' : 'Light Mode'}
					className="cursor-pointer"
				>
					{isDark ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
					<span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
