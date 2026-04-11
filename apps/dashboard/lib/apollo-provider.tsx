'use client';

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { createClient } from 'graphql-ws';
import { useCores } from './core/core-provider';
import { useMemo } from 'react';

function createApolloClient(baseUrl: string, token: string) {
	const graphqlUrl = `${baseUrl}/graphql`;
	const wsUrl = graphqlUrl.replace(/^http/, 'ws');

	const httpLink = new HttpLink({ uri: graphqlUrl });

	const authLink = setContext((_, { headers }) => ({
		headers: { ...headers, Authorization: token ? `Bearer ${token}` : '' },
	}));

	let link: ApolloLink = authLink.concat(httpLink);

	if (typeof window !== 'undefined') {
		const wsLink = new GraphQLWsLink(
			createClient({
				url: wsUrl,
				connectionParams: () => ({ authorization: token ? `Bearer ${token}` : '' }),
			}),
		);

		link = split(
			({ query }) => {
				const def = getMainDefinition(query);
				return def.kind === 'OperationDefinition' && def.operation === 'subscription';
			},
			wsLink,
			link,
		);
	}

	return new ApolloClient({ link, cache: new InMemoryCache() });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
	const { activeCore } = useCores();

	const client = useMemo(() => {
		const url = activeCore?.url ?? 'http://localhost:17773';
		const token = activeCore?.token ?? '';
		return createApolloClient(url, token);
	}, [activeCore?.url, activeCore?.token]);

	return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
