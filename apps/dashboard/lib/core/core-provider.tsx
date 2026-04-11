'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CoreConnection, getCores, getActiveCore, setActiveCore as storeSetActive, addCore as storeAddCore, removeCore as storeRemoveCore, updateCoreName as storeUpdateCoreName } from './store';
import { syncCoreConfig } from './api';

interface CoreContextValue {
	cores: CoreConnection[];
	activeCore: CoreConnection | null;
	setActiveCore: (id: string) => void;
	addCore: (core: CoreConnection) => void;
	removeCore: (id: string) => void;
	updateCoreName: (id: string, name: string, icon?: string | null) => void;
}

const CoreContext = createContext<CoreContextValue | null>(null);

export function CoreProvider({ children }: { children: React.ReactNode }) {
	const [cores, setCores] = useState<CoreConnection[]>([]);
	const [activeCoreId, setActiveCoreId] = useState<string | null>(null);
	const syncedRef = useRef(false);

	useEffect(() => {
		setCores(getCores());
		setActiveCoreId(getActiveCore()?.id ?? null);
	}, []);

	// Sync name & icon from each core's API on mount
	useEffect(() => {
		if (cores.length === 0 || syncedRef.current) return;
		syncedRef.current = true;

		cores.forEach(async (core) => {
			try {
				const config = await syncCoreConfig(core.url);
				if (config.name !== core.name || config.icon !== core.icon) {
					storeUpdateCoreName(core.id, config.name, config.icon);
					setCores(getCores());
				}
			} catch {
				// Core unreachable — skip
			}
		});
	}, [cores]);

	const activeCore = useMemo(() => cores.find((c) => c.id === activeCoreId) ?? cores[0] ?? null, [cores, activeCoreId]);

	const setActive = useCallback(
		(id: string) => {
			storeSetActive(id);
			setActiveCoreId(id);
		},
		[],
	);

	const addCore = useCallback((core: CoreConnection) => {
		storeAddCore(core);
		setCores(getCores());
		setActiveCoreId(core.id);
	}, []);

	const removeCoreCb = useCallback((id: string) => {
		storeRemoveCore(id);
		const remaining = getCores();
		setCores(remaining);
		setActiveCoreId(remaining[0]?.id ?? null);
	}, []);

	const updateCoreName = useCallback((id: string, name: string, icon?: string | null) => {
		storeUpdateCoreName(id, name, icon);
		setCores(getCores());
	}, []);

	return (
		<CoreContext.Provider value={{ cores, activeCore, setActiveCore: setActive, addCore, removeCore: removeCoreCb, updateCoreName }}>
			{children}
		</CoreContext.Provider>
	);
}

export function useCores() {
	const ctx = useContext(CoreContext);
	if (!ctx) throw new Error('useCores must be used within a CoreProvider');
	return ctx;
}
