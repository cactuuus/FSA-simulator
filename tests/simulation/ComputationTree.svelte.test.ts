import { describe, it, expect } from 'vitest';
import { FSAGraph } from '$lib/automata-models';
import { ComputationTree } from '$lib/simulation';
import { DFA, NFA, DPDA, PDA, infiniteLoopPDAs, infiniteLoopNFAs } from '../fsa-examples';
import { withReactivity } from '../helpers.svelte';
import { Warning_ID } from '$lib/simulation/computationTree';

// --- Helpers

function toSymbols(input: string): string[] {
	return input.split('');
}

function numberOfAcceptingPaths(tree: ComputationTree): number {
	return tree.pathsLeaves.filter((leaf) => leaf.isAccepting).length;
}

// --- DFA

const inputs = {
	DFA: {
		valid: ['acdbad', 'acdabad', 'acdcbad', 'acdaabad', 'acdabcbad', 'acdbbad', 'acdcabad'],
		invalid: ['acd', 'bad', '', 'acdbad1', 'acdbadd', 'acbad', 'adcbad']
	},
	NFA: {
		valid: ['101', '010', '0101', '1010', '00101', '11010', '001011', '110100', '10100', '01011'],
		invalid: ['000', '111', '00', '11', '0', '1', '', '0000', '1111', '001100']
	},
	DPDA: {
		valid: ['01', '0011', '000111', '00001111', '0000011111'],
		invalid: ['001', '011', '', '10', '0', '1', '0101', '00011']
	},
	PDA: {
		valid: ['0110', '1001', '00', '11', '0000', '1111', '010010', '01100110'],
		invalid: ['01', '10', '001', '0010', '0111', '010']
	}
};

describe('ComputationTree - DFA', () => {
	it('accepts a valid input', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(DFA);
			for (const input of inputs.DFA.valid) {
				const tree = new ComputationTree(fsa, toSymbols(input));
				expect(numberOfAcceptingPaths(tree), `expected '${input}' to be accepted`).toHaveLength(1);
			}
		});
	});

	it('rejects an invalid input', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(DFA);
			for (const input of inputs.DFA.invalid) {
				const tree = new ComputationTree(fsa, toSymbols(input));
				expect(numberOfAcceptingPaths(tree), `expected '${input}' to be rejected`).toBe(0);
			}
		});
	});

	it('throws when FSA has no start node', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON({ ...DFA, startNodeId: null });
			expect(() => new ComputationTree(fsa, toSymbols('acdbad'))).toThrow();
		});
	});
});

// --- NFA

describe('ComputationTree - NFA', () => {
	it('accepts a valid input', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(NFA);
			for (const input of inputs.NFA.valid) {
				const tree = new ComputationTree(fsa, toSymbols(input));
				expect(
					numberOfAcceptingPaths(tree),
					`expected '${input}' to be accepted`
				).toBeGreaterThanOrEqual(1);
			}
		});
	});

	it('rejects invalid input', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(NFA);
			for (const input of inputs.NFA.invalid) {
				const tree = new ComputationTree(fsa, toSymbols(input));
				expect(numberOfAcceptingPaths(tree), `expected '${input}' to be rejected`).toBe(0);
			}
		});
	});
});

// --- DPDA

describe('ComputationTree - DPDA', () => {
	it('accepts valid input', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(DPDA);
			for (const input of inputs.DPDA.valid) {
				const tree = new ComputationTree(fsa, toSymbols(input));
				expect(numberOfAcceptingPaths(tree), `expected '${input}' to be accepted`).toBe(1);
			}
		});
	});

	it('rejects invalid input', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(DPDA);
			for (const input of inputs.DPDA.invalid) {
				const tree = new ComputationTree(fsa, toSymbols(input));
				expect(numberOfAcceptingPaths(tree), `expected '${input}' to be rejected`).toBe(0);
			}
		});
	});
});

// --- PDA

describe('ComputationTree - PDA (ww^R)', () => {
	it('accepts a valid input', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(PDA);
			for (const input of inputs.PDA.valid) {
				const tree = new ComputationTree(fsa, toSymbols(input));
				expect(
					numberOfAcceptingPaths(tree),
					`expected '${input}' to be accepted`
				).toBeGreaterThanOrEqual(1);
			}
		});
	});

	it('rejects an invalid input', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(PDA);
			for (const input of inputs.PDA.invalid) {
				const tree = new ComputationTree(fsa, toSymbols(input));
				expect(numberOfAcceptingPaths(tree), `expected '${input}' to be rejected`).toBe(0);
			}
		});
	});
});

// --- Infinite loop detection

describe('ComputationTree - infinite loop detection', () => {
	it('halts when detecting a simple infinite epsilon loop in an NFA', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			infiniteLoopNFAs.forEach((infinite_NFA) => {
				fsa.loadFromJSON(infinite_NFA);
				const tree = new ComputationTree(fsa, [], 2);
				expect(tree.warnings.length).toBeGreaterThan(0);
				expect(tree.warnings.map((w) => w.id).some((id) => id === Warning_ID.INFINITE_LOOP)).toBe(
					true
				);
			});
		});
	});

	it('halts when detecting an infinite epsilon loop with ever growing stack in a PDA', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			infiniteLoopPDAs.forEach((infinite_PDA) => {
				fsa.loadFromJSON(infinite_PDA);
				const tree = new ComputationTree(fsa, [], 2);
				expect(tree.warnings.length).toBeGreaterThan(0);
				expect(tree.warnings.map((w) => w.id).some((id) => id === Warning_ID.INFINITE_LOOP)).toBe(
					true
				);
			});
		});
	});
});
