'use client';

import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

const CODE_LENGTH = 8;

interface SetupCodeInputProps {
	value: string;
	onChange: (value: string) => void;
	onComplete?: (value: string) => void;
}

export function SetupCodeInput({ value, onChange, onComplete }: SetupCodeInputProps) {
	const chars = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '');
	const refs = useRef<(HTMLInputElement | null)[]>([]);

	const setRef = useCallback((i: number) => (el: HTMLInputElement | null) => {
		refs.current[i] = el;
	}, []);

	function updateValue(newChars: string[]) {
		const next = newChars.join('').slice(0, CODE_LENGTH);
		onChange(next);
		if (next.length === CODE_LENGTH) {
			onComplete?.(next);
		}
	}

	function handleInput(i: number, inputValue: string) {
		const cleaned = inputValue.replace(/[^a-zA-Z0-9]/g, '');
		if (!cleaned) return;

		const newChars = [...chars];

		if (cleaned.length === 1) {
			newChars[i] = cleaned;
			updateValue(newChars);
			if (i < CODE_LENGTH - 1) {
				refs.current[i + 1]?.focus();
			}
		} else {
			// Multi-char paste/autofill: fill from current position
			for (let j = 0; j < cleaned.length && i + j < CODE_LENGTH; j++) {
				newChars[i + j] = cleaned[j];
			}
			updateValue(newChars);
			const focusIdx = Math.min(i + cleaned.length, CODE_LENGTH - 1);
			refs.current[focusIdx]?.focus();
		}
	}

	function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Backspace') {
			e.preventDefault();
			const newChars = [...chars];
			if (chars[i] && chars[i] !== '') {
				newChars[i] = '';
				updateValue(newChars);
			} else if (i > 0) {
				newChars[i - 1] = '';
				updateValue(newChars);
				refs.current[i - 1]?.focus();
			}
		} else if (e.key === 'ArrowLeft' && i > 0) {
			e.preventDefault();
			refs.current[i - 1]?.focus();
		} else if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) {
			e.preventDefault();
			refs.current[i + 1]?.focus();
		}
	}

	function handlePaste(i: number, e: ClipboardEvent<HTMLInputElement>) {
		e.preventDefault();
		const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '');
		if (!pasted) return;
		handleInput(i, pasted);
	}

	function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
		e.target.select();
	}

	return (
		<div className="flex items-center justify-center gap-1.5">
			{chars.map((char, i) => (
				<div key={i} className="contents">
					{i === 4 && (
						<span className="text-muted-foreground text-lg font-bold select-none px-0.5">–</span>
					)}
					<input
						ref={setRef(i)}
						type="text"
						inputMode="text"
						autoComplete="off"
						maxLength={1}
						value={char}
						onChange={(e) => handleInput(i, e.target.value)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						onPaste={(e) => handlePaste(i, e)}
						onFocus={handleFocus}
						className={cn(
							'h-11 w-10 rounded-md border border-input bg-background text-center font-mono text-lg uppercase',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
							'transition-colors',
						)}
					/>
				</div>
			))}
		</div>
	);
}
