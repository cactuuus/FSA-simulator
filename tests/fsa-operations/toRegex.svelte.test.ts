import { describe, it, expect } from 'vitest';
import { FSAGraph } from '$lib/automata-models';
import { nonPushdownExamples, pushdownExamples } from '../fsa-examples';
import { toRegex } from '$lib/fsa-operations';
import { withReactivity, toSymbols } from '../helpers.svelte';

// --- Helpers

function regexAccepts(regex: string, input: string): boolean {
	return new RegExp(`^(${regex})$`).test(input);
}

// --- Basics

describe('toRegex - basics', () => {
	it('throws on Pushdown Automata (PDAs & DPDAs)', () => {
		withReactivity(() => {
			for (const example of pushdownExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				expect(
					() => toRegex(fsa),
					`[${example.language}] expected toRegex to throw on PDA`
				).toThrow();
			}
		});
	});
});

// --- Equivalence

describe('toRegex - equivalence', () => {
	it('accepts the same valid inputs as the original FSA', () => {
		withReactivity(() => {
			for (const example of nonPushdownExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				const regex = toRegex(fsa);
				for (const input of example.validInputs) {
					const joined = toSymbols(fsa, input).join('');
					expect(
						regexAccepts(regex, joined),
						`[${example.language}] regex '${regex}' should accept '${input}'`
					).toBe(true);
				}
			}
		});
	});

	it('rejects the same invalid inputs as the original FSA', () => {
		withReactivity(() => {
			for (const example of nonPushdownExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				const regex = toRegex(fsa);
				for (const input of example.invalidInputs) {
					const joined = toSymbols(fsa, input).join('');
					expect(
						regexAccepts(regex, joined),
						`[${example.language}] regex '${regex}' should reject '${input}'`
					).toBe(false);
				}
			}
		});
	});
});
