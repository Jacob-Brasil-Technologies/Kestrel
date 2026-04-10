export interface CoreConnection {
	id: string;
	name: string;
	url: string;
	token: string;
	icon?: string | null;
}

const STORAGE_KEY = 'kestrel_cores';
const ACTIVE_KEY = 'kestrel_active_core';

function readCores(): CoreConnection[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
	} catch {
		return [];
	}
}

function writeCores(cores: CoreConnection[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(cores));
}

export function getCores(): CoreConnection[] {
	return readCores();
}

export function getActiveCore(): CoreConnection | null {
	const cores = readCores();
	if (cores.length === 0) return null;
	const activeId = localStorage.getItem(ACTIVE_KEY);
	return cores.find((c) => c.id === activeId) ?? cores[0];
}

export function setActiveCore(id: string) {
	localStorage.setItem(ACTIVE_KEY, id);
}

export function addCore(core: CoreConnection) {
	const cores = readCores();
	const existing = cores.findIndex((c) => c.id === core.id);
	if (existing >= 0) {
		cores[existing] = core;
	} else {
		cores.push(core);
	}
	writeCores(cores);
	setActiveCore(core.id);
}

export function removeCore(id: string) {
	const cores = readCores().filter((c) => c.id !== id);
	writeCores(cores);
	const activeId = localStorage.getItem(ACTIVE_KEY);
	if (activeId === id) {
		localStorage.setItem(ACTIVE_KEY, cores[0]?.id ?? '');
	}
}

export function updateCoreToken(id: string, token: string) {
	const cores = readCores();
	const core = cores.find((c) => c.id === id);
	if (core) {
		core.token = token;
		writeCores(cores);
	}
}

export function updateCoreName(id: string, name: string, icon?: string | null) {
	const cores = readCores();
	const core = cores.find((c) => c.id === id);
	if (core) {
		core.name = name;
		if (icon !== undefined) core.icon = icon;
		writeCores(cores);
	}
}
