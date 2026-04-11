import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ApolloProvider } from '@/lib/apollo-provider';
import { CoreProvider } from '@/lib/core/core-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const geistSans = Geist({
	subsets: ['latin'],
	variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-geist-mono',
});

export const metadata: Metadata = {
	title: 'Kestrel',
	description: 'Game server management dashboard',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
			<body className="h-dvh overflow-hidden flex flex-col antialiased">
				<Analytics />
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
					<CoreProvider>
						<ApolloProvider>{children}</ApolloProvider>
					</CoreProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
