import { describe, it, expect } from 'vitest';
import { FSAGraph, FSAType } from '$lib/automata-models';
import { ComputationTree } from '$lib/simulation';
import { minimizableDFAExamples } from '../fsa-examples';
import { minimizeDfa } from '$lib/fsa-operations';
import { withReactivity, toSymbols, numberOfAcceptingPaths } from '../helpers.svelte';

// --- Basics

describe('minimizeDfa - basics', () => {
	it('output is still a DFA', () => {
		withReactivity(() => {
			for (const example of minimizableDFAExamples) {
				const dfa = new FSAGraph();
				dfa.loadFromJSON(example.fsa);
				const minimized = minimizeDfa(dfa)!;
				expect(minimized.type, `[${example.language}] expected output to be a DFA`).toBe(
					FSAType.DFA
				);
			}
		});
	});

	it('output has the expected number of nodes', () => {
		withReactivity(() => {
			for (const example of minimizableDFAExamples) {
				const dfa = new FSAGraph();
				dfa.loadFromJSON(example.fsa);
				const minimized = minimizeDfa(dfa)!;
				expect(
					minimized.nodes.length,
					`[${example.language}] expected ${example.minimizedNodeCount} nodes`
				).toBe(example.minimizedNodeCount);
			}
		});
	});

	it('minimizing an already minimized DFA returns null', () => {
		withReactivity(() => {
			for (const example of minimizableDFAExamples) {
				const dfa = new FSAGraph();
				dfa.loadFromJSON(example.fsa);
				const minimized = minimizeDfa(dfa)!;
				const minimizedAgain = minimizeDfa(minimized);
				expect(minimizedAgain, `[${example.language}] expected null on second minimization`).toBe(
					null
				);
			}
		});
	});
});

// --- Equivalence

describe('minimizeDfa - equivalence', () => {
	it('accepts the same valid inputs as the original DFA', () => {
		withReactivity(() => {
			for (const example of minimizableDFAExamples) {
				const dfa = new FSAGraph();
				dfa.loadFromJSON(example.fsa);
				const minimized = minimizeDfa(dfa)!;
				for (const input of example.validInputs) {
					const tree = new ComputationTree(minimized, toSymbols(minimized, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be accepted`
					).toBe(1);
				}
			}
		});
	});

	it('rejects the same invalid inputs as the original DFA', () => {
		withReactivity(() => {
			for (const example of minimizableDFAExamples) {
				const dfa = new FSAGraph();
				dfa.loadFromJSON(example.fsa);
				const minimized = minimizeDfa(dfa)!;
				for (const input of example.invalidInputs) {
					const tree = new ComputationTree(minimized, toSymbols(minimized, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be rejected`
					).toBe(0);
				}
			}
		});
	});
});
