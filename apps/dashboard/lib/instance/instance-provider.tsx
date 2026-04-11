'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useCores } from '@/lib/core/core-provider';
import type { InstanceStatus, GameType } from '@/lib/gql/graphql';

export const GET_INSTANCES = gql`
	query GetInstances {
		instances {
			id
			name
			status
			gameType
			gameInfo {
				name
				icon
			}
		}
	}
`;

export interface InstanceData {
	id: string;
	name: string;
	status: InstanceStatus;
	gameType: GameType;
	gameInfo: { name: string; icon: string };
}

export type SidebarView = 'overview' | 'console' | 'files' | 'settings';

interface InstanceContextValue {
	instances: InstanceData[];
	activeInstance: InstanceData | null;
	setActiveInstanceId: (id: string) => void;
	loading: boolean;
	activeView: SidebarView;
	setActiveView: (view: SidebarView) => void;
}

const InstanceContext = createContext<InstanceContextValue | null>(null);

export function InstanceProvider({ children }: { children: React.ReactNode }) {
	const { activeCore } = useCores();
	const { data, loading: queryLoading } = useQuery<{ instances: InstanceData[] }>(GET_INSTANCES, {
		skip: !activeCore,
		pollInterval: 5000,
	});

	const instances = data?.instances ?? [];

	// Only show loading for the initial fetch — not during poll refetches.
	// Apollo Client 4.x sets loading=true on polls, which would unmount the
	// dropdown/dialog in InstanceSwitcher and reset user state.
	const initialLoadDone = useRef(false);
	if (data) initialLoadDone.current = true;
	const loading = queryLoading && !initialLoadDone.current;

	const [activeId, setActiveId] = useState<string | null>(null);
	const [activeView, setActiveView] = useState<SidebarView>('console');

	// Auto-select first instance when data loads
	useEffect(() => {
		if (instances.length > 0 && (!activeId || !instances.find((i) => i.id === activeId))) {
			setActiveId(instances[0].id);
		}
	}, [instances, activeId]);

	const activeInstance = useMemo(
		() => instances.find((i) => i.id === activeId) ?? instances[0] ?? null,
		[instances, activeId],
	);

	const setActiveInstanceId = useCallback((id: string) => {
		setActiveId(id);
	}, []);

	return (
		<InstanceContext.Provider
			value={{ instances, activeInstance, setActiveInstanceId, loading, activeView, setActiveView }}
		>
			{children}
		</InstanceContext.Provider>
	);
}

export function useInstance() {
	const ctx = useContext(InstanceContext);
	if (!ctx) throw new Error('useInstance must be used within an InstanceProvider');
	return ctx;
}
