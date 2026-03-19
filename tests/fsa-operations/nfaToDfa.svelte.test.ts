import { describe, it, expect } from 'vitest';
import { FSAGraph, FSAType } from '$lib/automata-models';
import { ComputationTree } from '$lib/simulation';
import { nfaExamples } from '../fsa-examples';
import { NfaToDfa } from '$lib/fsa-operations';
import { withReactivity, toSymbols, numberOfAcceptingPaths } from '../helpers.svelte';

// --- Basics

describe('NfaToDfa - basics', () => {
	it('output is a DFA', () => {
		withReactivity(() => {
			for (const example of nfaExamples) {
				const nfa = new FSAGraph();
				nfa.loadFromJSON(example.fsa);
				const dfa = NfaToDfa(nfa);
				expect(dfa.type, `[${example.language}] expected output to be a DFA`).toBe(FSAType.DFA);
			}
		});
	});

	it('throws on non-NFA input', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(nfaExamples[0].fsa);
			const dfa = NfaToDfa(fsa);
			expect(() => NfaToDfa(dfa)).toThrow();
		});
	});
});

// --- Equivalence

describe('NfaToDfa - equivalence', () => {
	it('accepts the same valid inputs as the original NFA', () => {
		withReactivity(() => {
			for (const example of nfaExamples) {
				const nfa = new FSAGraph();
				nfa.loadFromJSON(example.fsa);
				const dfa = NfaToDfa(nfa);
				for (const input of example.validInputs) {
					const tree = new ComputationTree(dfa, toSymbols(dfa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be accepted`
					).toBeGreaterThan(0);
				}
			}
		});
	});

	it('rejects the same invalid inputs as the original NFA', () => {
		withReactivity(() => {
			for (const example of nfaExamples) {
				const nfa = new FSAGraph();
				nfa.loadFromJSON(example.fsa);
				const dfa = NfaToDfa(nfa);
				for (const input of example.invalidInputs) {
					const tree = new ComputationTree(dfa, toSymbols(dfa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be rejected`
					).toBe(0);
				}
			}
		});
	});
});
