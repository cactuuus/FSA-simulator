import { describe, it, expect } from 'vitest';
import { FSAGraph } from '$lib/automata-models';
import { ComputationTree } from '$lib/simulation';
import {
	dfaExamples,
	nfaExamples,
	pdaExamples,
	dpdaExamples,
	infiniteLoopNfaExamples,
	infiniteLoopPdaExamples
} from '../fsa-examples';
import { Warning_ID } from '$lib/simulation/computationTree';
import { withReactivity, toSymbols, numberOfAcceptingPaths } from '../helpers.svelte';

// --- DFA

describe('ComputationTree - DFA', () => {
	it('accepts valid inputs', () => {
		withReactivity(() => {
			for (const example of dfaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				for (const input of example.validInputs) {
					const tree = new ComputationTree(fsa, toSymbols(fsa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be accepted`
					).toBe(1);
				}
			}
		});
	});

	it('rejects invalid inputs', () => {
		withReactivity(() => {
			for (const example of dfaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				for (const input of example.invalidInputs) {
					const tree = new ComputationTree(fsa, toSymbols(fsa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be rejected`
					).toBe(0);
				}
			}
		});
	});

	it('throws when FSA has no start node', () => {
		withReactivity(() => {
			for (const example of dfaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON({ ...example.fsa, startNodeId: null });
				expect(() => new ComputationTree(fsa, toSymbols(fsa, example.validInputs[0]))).toThrow();
			}
		});
	});
});

// --- NFA

describe('ComputationTree - NFA', () => {
	it('accepts valid inputs', () => {
		withReactivity(() => {
			for (const example of nfaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				for (const input of example.validInputs) {
					const tree = new ComputationTree(fsa, toSymbols(fsa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be accepted`
					).toBeGreaterThanOrEqual(1);
				}
			}
		});
	});

	it('rejects invalid inputs', () => {
		withReactivity(() => {
			for (const example of nfaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				for (const input of example.invalidInputs) {
					const tree = new ComputationTree(fsa, toSymbols(fsa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be rejected`
					).toBe(0);
				}
			}
		});
	});
});

// --- DPDA

describe('ComputationTree - DPDA', () => {
	it('accepts valid inputs', () => {
		withReactivity(() => {
			for (const example of dpdaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				for (const input of example.validInputs) {
					const tree = new ComputationTree(fsa, toSymbols(fsa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be accepted`
					).toBe(1);
				}
			}
		});
	});

	it('rejects invalid inputs', () => {
		withReactivity(() => {
			for (const example of dpdaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				for (const input of example.invalidInputs) {
					const tree = new ComputationTree(fsa, toSymbols(fsa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be rejected`
					).toBe(0);
				}
			}
		});
	});
});

// --- PDA

describe('ComputationTree - PDA', () => {
	it('accepts valid inputs', () => {
		withReactivity(() => {
			for (const example of pdaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				for (const input of example.validInputs) {
					const tree = new ComputationTree(fsa, toSymbols(fsa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be accepted`
					).toBeGreaterThanOrEqual(1);
				}
			}
		});
	});

	it('rejects invalid inputs', () => {
		withReactivity(() => {
			for (const example of pdaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				for (const input of example.invalidInputs) {
					const tree = new ComputationTree(fsa, toSymbols(fsa, input));
					expect(
						numberOfAcceptingPaths(tree),
						`[${example.language}] expected '${input}' to be rejected`
					).toBe(0);
				}
			}
		});
	});
});

// --- Infinite loop detection

describe('ComputationTree - infinite loop detection', () => {
	it('halts when detecting a simple infinite epsilon loop in an NFA', () => {
		withReactivity(() => {
			for (const example of infiniteLoopNfaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				const tree = new ComputationTree(fsa, [], 2);
				expect(tree.warnings.length).toBeGreaterThan(0);
				expect(tree.warnings.map((w) => w.id).some((id) => id === Warning_ID.INFINITE_LOOP)).toBe(
					true
				);
			}
		});
	});

	it('halts when detecting an infinite epsilon loop with ever growing stack in a PDA', () => {
		withReactivity(() => {
			for (const example of infiniteLoopPdaExamples) {
				const fsa = new FSAGraph();
				fsa.loadFromJSON(example.fsa);
				const tree = new ComputationTree(fsa, [], 2);
				expect(tree.warnings.length).toBeGreaterThan(0);
				expect(tree.warnings.map((w) => w.id).some((id) => id === Warning_ID.INFINITE_LOOP)).toBe(
					true
				);
			}
		});
	});
});
