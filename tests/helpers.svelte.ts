import { FSAGraph } from '$lib/automata-models';
import { ComputationTree } from '$lib/simulation';

/**
 * Allows running a test with a reactive context (like a $derived rune).
 * @param testFunction The test function to run
 */
export function withReactivity(testFunction: () => void) {
	const cleanup = $effect.root(testFunction);
	cleanup();
}

/**
 * Useful to convert string inputs to arrays of symbols for testing.
 * @param fsa The FSA whose alphabet is used to determine how to split the input string into symbols
 * @param input The input string to convert
 * @returns An array of symbols corresponding to the input string
 */
export function toSymbols(fsa: FSAGraph, input: string): string[] {
	if (input === '') return [];
	const alphabet = [...fsa.alphabet()];
	const isMultiChar = alphabet.some((s) => s.length > 1);
	return isMultiChar ? input.split(',').map((s) => s.trim()) : input.split('');
}

/**
 * After running a simulation and obtaining a computation tree, this function counts how many accepting paths the tree has (it does so by counting the accepting leaves found).
 * @param tree The computation tree to analyze
 * @returns The number of accepting paths in the tree
 */
export function numberOfAcceptingPaths(tree: ComputationTree): number {
	return tree.pathsLeaves.filter((leaf) => leaf.isAccepting).length;
}
