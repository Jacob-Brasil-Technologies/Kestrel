import { CoreConnection } from './store';

/** Normalise a user-entered URL into a GraphQL endpoint */
function normaliseUrl(input: string): string {
	let url = input.trim().replace(/\/+$/, '');
	if (!url.endsWith('/graphql')) {
		url += '/graphql';
	}
	return url;
}

/** Raw GraphQL fetch against an arbitrary core URL (no Apollo needed) */
async function gqlFetch<T>(url: string, query: string, variables?: Record<string, unknown>, token?: string): Promise<T> {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify({ query, variables }),
	});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status}: ${res.statusText}`);
	}

	const json = await res.json();
	if (json.errors?.length) {
		throw new Error(json.errors[0].message);
	}
	return json.data as T;
}

// --- GraphQL operations ---

const CORE_CONFIG_QUERY = `
  query CoreConfig {
    coreConfig {
      id
      name
      icon
      isSetup
    }
  }
`;

const HAS_USERS_QUERY = `
  query HasUsers {
    hasUsers
  }
`;

const SETUP_CORE_MUTATION = `
  mutation SetupCore($code: String!) {
    setupCore(code: $code) {
      config { id name icon isSetup }
      setupToken
    }
  }
`;

const CREATE_ADMIN_MUTATION = `
  mutation CreateAdmin($input: CreateAdminInput!) {
    createAdmin(input: $input) {
      token
      user { id username role }
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id username role mustChangePassword }
    }
  }
`;

const UPDATE_CORE_MUTATION = `
  mutation UpdateCore($input: UpdateCoreInput!) {
    updateCore(input: $input) {
      id name icon isSetup
    }
  }
`;

// --- Public API ---

export interface CoreInfo {
	id: string;
	name: string;
	icon: string | null;
	isSetup: boolean;
}

export interface SetupResult {
	config: CoreInfo;
	setupToken: string;
}

export interface AuthResult {
	token: string;
	user: { id: string; username: string; role: string; mustChangePassword?: boolean };
}

/** Check if a core is reachable and return its config */
export async function fetchCoreInfo(rawUrl: string): Promise<{ url: string; config: CoreInfo }> {
	const url = normaliseUrl(rawUrl);
	const data = await gqlFetch<{ coreConfig: CoreInfo }>(url, CORE_CONFIG_QUERY);
	if (!data.coreConfig) throw new Error('Could not reach core. Check the URL and try again.');
	return { url, config: data.coreConfig };
}

/** Fetch the latest core config for an already-connected core */
export async function syncCoreConfig(baseUrl: string): Promise<CoreInfo> {
	const url = normaliseUrl(baseUrl);
	const data = await gqlFetch<{ coreConfig: CoreInfo }>(url, CORE_CONFIG_QUERY);
	if (!data.coreConfig) throw new Error('Could not reach core.');
	return data.coreConfig;
}

/** Check if the core already has users (i.e. has been set up) */
export async function checkHasUsers(graphqlUrl: string): Promise<boolean> {
	const data = await gqlFetch<{ hasUsers: boolean }>(graphqlUrl, HAS_USERS_QUERY);
	return data.hasUsers;
}

/** Submit setup code to a core, returns a short-lived setup token */
export async function submitSetupCode(graphqlUrl: string, code: string): Promise<SetupResult> {
	const data = await gqlFetch<{ setupCore: SetupResult }>(graphqlUrl, SETUP_CORE_MUTATION, { code });
	return data.setupCore;
}

/** Create the admin account using the setup token */
export async function createAdmin(graphqlUrl: string, setupToken: string, username: string, password: string): Promise<AuthResult> {
	const data = await gqlFetch<{ createAdmin: AuthResult }>(graphqlUrl, CREATE_ADMIN_MUTATION, {
		input: { setupToken, username, password },
	});
	return data.createAdmin;
}

/** Login to an existing core */
export async function login(graphqlUrl: string, username: string, password: string): Promise<AuthResult> {
	const data = await gqlFetch<{ login: AuthResult }>(graphqlUrl, LOGIN_MUTATION, {
		input: { username, password },
	});
	return data.login;
}

/** Build a CoreConnection from auth result + URL info */
export function buildCoreConnection(url: string, name: string, auth: AuthResult, icon?: string | null): CoreConnection {
	return {
		id: crypto.randomUUID(),
		name,
		url: url.replace(/\/graphql$/, ''),
		token: auth.token,
		icon: icon ?? null,
	};
}

/** Update core config (name and/or icon). Uses multipart upload for the icon file. */
export async function updateCore(
	graphqlUrl: string,
	token: string,
	name?: string,
	iconFile?: File,
): Promise<CoreInfo> {
	if (iconFile) {
		// Use GraphQL multipart request spec for file upload
		const operations = JSON.stringify({
			query: UPDATE_CORE_MUTATION,
			variables: { input: { name: name || undefined, icon: null } },
		});
		const map = JSON.stringify({ '0': ['variables.input.icon'] });

		const form = new FormData();
		form.append('operations', operations);
		form.append('map', map);
		form.append('0', iconFile);

		const res = await fetch(graphqlUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Apollo-Require-Preflight': 'true',
			},
			body: form,
		});

		if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
		const json = await res.json();
		if (json.errors?.length) throw new Error(json.errors[0].message);
		return json.data.updateCore as CoreInfo;
	} else {
		// Name-only update, no file
		const data = await gqlFetch<{ updateCore: CoreInfo }>(
			graphqlUrl,
			UPDATE_CORE_MUTATION,
			{ input: { name } },
			token,
		);
		return data.updateCore;
	}
}
