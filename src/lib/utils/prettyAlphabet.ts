import { FSAGraph } from '$lib/automata-models';

/**
 * Helper function to return a pretty string representation of the input alphabet of the given graph.
 * @param fsa The graph which alphabet we want to prettify.
 * @returns A string representation of the input alphabet of the given graph, sorted and enclosed in curly braces. If the alphabet is empty, returns '∅'.
 */
export function prettyInputAlphabet(fsa: FSAGraph): string {
	const sortedAlphabet = [...fsa.alphabet(false)].sort();
	if (sortedAlphabet.length === 0) return '∅';
	return `{ ${sortedAlphabet.join(', ')} }`;
}

/**
 * Helper function to return a pretty string representation of the stack alphabet of the given graph.
 * @param fsa The graph which stack alphabet we want to prettify.
 * @returns A string representation of the stack alphabet of the given graph, sorted and enclosed in curly braces. If the alphabet is empty, returns '∅'.
 */
export function prettyStackAlphabet(fsa: FSAGraph): string {
	const sortedAlphabet = [...fsa.stackAlphabet(false)].sort();
	if (sortedAlphabet.length === 0) return '∅';
	return `{ ${sortedAlphabet.join(', ')} }`;
}
