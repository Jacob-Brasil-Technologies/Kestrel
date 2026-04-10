'use client';

import { useEffect, useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { useInstance } from '@/lib/instance/instance-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendIcon, TerminalSquareIcon, ArrowDownIcon } from 'lucide-react';

const CONSOLE_HISTORY = gql`
	query ConsoleHistory($instanceId: ID!) {
		consoleHistory(instanceId: $instanceId) {
			instanceId
			line
			timestamp
			source
		}
	}
`;

const CONSOLE_LOGS_SUBSCRIPTION = gql`
	subscription ConsoleLogs($instanceId: ID!) {
		consoleLogs(instanceId: $instanceId) {
			instanceId
			line
			timestamp
			source
		}
	}
`;

const SEND_COMMAND = gql`
	mutation SendCommand($instanceId: ID!, $command: String!) {
		sendCommand(instanceId: $instanceId, command: $command)
	}
`;

interface ConsoleLine {
	instanceId: string;
	line: string;
	timestamp: string;
	source: 'STDOUT' | 'STDERR' | 'SYSTEM';
}

function lineColor(source: ConsoleLine['source']): string {
	switch (source) {
		case 'STDERR':
			return 'text-red-400';
		case 'SYSTEM':
			return 'text-blue-400';
		default:
			return 'text-neutral-200';
	}
}

function formatTimestamp(ts: string): string {
	try {
		const d = new Date(ts);
		return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	} catch {
		return '';
	}
}

export function ServerConsole() {
	const { activeInstance } = useInstance();
	const [lines, setLines] = useState<ConsoleLine[]>([]);
	const [command, setCommand] = useState('');
	const [autoScroll, setAutoScroll] = useState(true);
	const scrollRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const instanceId = activeInstance?.id;

	// Fetch history
	const { data: historyData } = useQuery<{ consoleHistory: ConsoleLine[] }>(CONSOLE_HISTORY, {
		variables: { instanceId },
		skip: !instanceId,
		fetchPolicy: 'network-only',
	});

	// Load history when it arrives or instance changes
	useEffect(() => {
		if (historyData?.consoleHistory) {
			setLines(historyData.consoleHistory);
		}
	}, [historyData]);

	// Reset lines when instance changes
	useEffect(() => {
		setLines([]);
		setAutoScroll(true);
	}, [instanceId]);

	// Subscribe to live logs
	useSubscription<{ consoleLogs: ConsoleLine }>(CONSOLE_LOGS_SUBSCRIPTION, {
		variables: { instanceId },
		skip: !instanceId,
		onData: ({ data: subData }) => {
			if (subData.data?.consoleLogs) {
				setLines((prev) => [...prev, subData.data!.consoleLogs]);
			}
		},
	});

	// Send command mutation
	const [sendCommand] = useMutation(SEND_COMMAND);

	// Auto-scroll
	useEffect(() => {
		if (autoScroll && bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [lines, autoScroll]);

	// Detect scroll position to toggle auto-scroll
	function handleScroll() {
		const el = scrollRef.current;
		if (!el) return;
		const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
		setAutoScroll(isAtBottom);
	}

	async function handleSend() {
		if (!command.trim() || !instanceId) return;
		try {
			await sendCommand({ variables: { instanceId, command: command.trim() } });
			setCommand('');
		} catch (e) {
			// Command will show error in console via system message
		}
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	if (!activeInstance) {
		return (
			<div className="flex flex-1 items-center justify-center text-muted-foreground">
				<div className="text-center">
					<TerminalSquareIcon className="mx-auto mb-3 size-10 opacity-40" />
					<p className="text-sm">No instance selected</p>
					<p className="text-xs mt-1">Select or create an instance to view its console.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col min-h-0">
			<div
				ref={scrollRef}
				onScroll={handleScroll}
				className="flex-1 overflow-y-auto bg-neutral-950 rounded-lg p-3 font-mono text-xs leading-relaxed min-h-0"
			>
				{lines.length === 0 && (
					<div className="flex h-full items-center justify-center text-neutral-600">
						<div className="text-center">
							<TerminalSquareIcon className="mx-auto mb-2 size-8" />
							<p>No console output yet.</p>
							<p className="mt-1 text-[10px]">Start the server to see logs here.</p>
						</div>
					</div>
				)}
				{lines.map((line, i) => (
					<div key={i} className={`whitespace-pre-wrap break-all ${lineColor(line.source)}`}>
						<span className="text-neutral-600 select-none mr-2">{formatTimestamp(line.timestamp)}</span>
						{line.line}
					</div>
				))}
				<div ref={bottomRef} />
			</div>

			{/* Scroll to bottom button */}
			{!autoScroll && (
				<div className="flex justify-center -mt-10 mb-2 relative z-10">
					<Button
						variant="secondary"
						size="sm"
						className="rounded-full shadow-lg opacity-80 hover:opacity-100"
						onClick={() => {
							bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
							setAutoScroll(true);
						}}
					>
						<ArrowDownIcon className="mr-1 size-3" />
						Scroll to bottom
					</Button>
				</div>
			)}

			{/* Command input */}
			<div className="flex gap-2 mt-2">
				<div className="relative flex-1">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm select-none">&gt;</span>
					<Input
						value={command}
						onChange={(e) => setCommand(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a command..."
						className="pl-7 font-mono text-sm"
						disabled={activeInstance.status !== 'RUNNING'}
					/>
				</div>
				<Button
					onClick={handleSend}
					disabled={!command.trim() || activeInstance.status !== 'RUNNING'}
					size="default"
				>
					<SendIcon className="size-4" />
				</Button>
			</div>
		</div>
	);
}
