import { FSAGraph, Node, Transition } from '$lib/automata/models';

/**
 * Represents a transition table for an FSA without stack operations (basically DFA & NFA).
 * - states: list of state labels (rows).
 * - alphabet: list of input symbols (columns).
 * - content: 3D array in the format **[state][input symbol][target state]**. In other words, **content[i][j]** gives the list of target states when in **state i** and reading input **symbol j**.
 *
 * NOTE: **content[i][j]** can be an empty list (no transitions), a single-element list (deterministic transition), or a multi-element list (non-deterministic transitions).
 */
export interface TransitionTable {
	states: string[];
	alphabet: string[];
	content: string[][][];
}

/**
 * Represents a transition table for an FSA without stack operations (basically DPDA & PDA).
 * - states: list of state labels (rows).
 * - alphabet: list of input symbols paired with stack operations (columns).
 * - content: 3D array in the format **[state][(input symbol, symbol to pop)][symbol to push & target state]**. In other words, **content[(i,x)][j]** gives the list of target states with stack top when in **state i** and popping **symbol x** from the stack.
 *
 * NOTE: **content[i][j]** can be an empty list (no transitions), a single-element list (deterministic transition), or a multi-element list (non-deterministic transitions).
 */
export interface TransitionTableWithStack {
	states: string[];
	alphabet: string[][];
	content: string[][][];
}

/**
 * Generates the transition table for the given FSA.
 * @param fsa The FSA graph.
 * @returns The correcponding transition table.
 */
export function getTransitionTable(fsa: FSAGraph) {
	if (fsa.hasStackOps) return getTransitionTableWithStack(fsa);
	return getTransitionTableWithoutStack(fsa);
}

/**
 * Generates the transition table for an FSA without stack operations (DFA & NFA).
 * @param fsa The FSA graph.
 * @returns The corresponding transition table.
 */
function getTransitionTableWithoutStack(fsa: FSAGraph): TransitionTable {
	const uniqueLabels = getNodeIdToLabelMap(fsa.nodes);
	const sortedNodes = [...fsa.nodes].sort((a, b) => {
		const labelA = uniqueLabels.get(a.id)!;
		const labelB = uniqueLabels.get(b.id)!;
		return labelA.localeCompare(labelB);
	});

	const states = sortedNodes.map((node) => uniqueLabels.get(node.id)!);
	const alphabet = sortedAlphabet(fsa.alphabet);
	const content = emptyTransitionMatrix(states.length, alphabet.length);

	// for quick lookup of symbol index (aka column index)
	const symbolIndex = new Map<string, number>();
	alphabet.forEach((symbol, index) => symbolIndex.set(symbol, index));

	sortedNodes.forEach((node, row) => {
		const outgoingEdges = fsa.edgesBySource.get(node.id) ?? [];
		outgoingEdges.forEach((edge) => {
			edge.transitions.forEach((transition) => {
				const targetLabel = uniqueLabels.get(edge.to.id)!;
				const col = symbolIndex.get(transition.consume)!;
				content[row][col].push(targetLabel);
			});
		});
	});

	return { states, alphabet, content };
}

function getTransitionTableWithStack(fsa: FSAGraph): TransitionTableWithStack {
	const table: TransitionTableWithStack = { states: [], alphabet: [], content: [] };

	throw new Error('Not yet implemented');

	return table;
}

/**
 * Generates a map from node IDs to unique labels.
 * If multiple nodes share the same label, a suffix is added to make them unique (aka "q0" and "q0 (1)").
 * @param nodes The list of nodes in the FSA.
 * @returns A map from node IDs to their unique labels.
 */
function getNodeIdToLabelMap(nodes: Node[]): Map<string, string> {
	const seen = new Set<string>();
	const idToLabel = new Map<string, string>();

	nodes.forEach((node) => {
		let label = node.label;
		let counter = 1;
		while (seen.has(label)) {
			label = `${node.label} (${counter})`;
			counter++;
		}
		idToLabel.set(node.id, label);
		seen.add(label);
	});

	return idToLabel;
}

/**
 * Returns a sorted array of the given alphabet, with EPSILON always at the end.
 * @param alphabet The input alphabet as a set of strings.
 * @returns A sorted array of the alphabet.
 */
function sortedAlphabet(alphabet: Set<string>): Array<string> {
	return [...alphabet].sort((a, b) => {
		if (a === Transition.EPSILON) return 1;
		if (b === Transition.EPSILON) return -1;
		return a.localeCompare(b);
	});
}

/**
 * Helper to create an empty transition matrix, in the from of a 3D array filled with empty lists.
 * @param rows Number of rows
 * @param cols Number of columns
 * @returns An empty 3D array with the given dimensions.
 */
function emptyTransitionMatrix(rows: number, cols: number): string[][][] {
	return Array.from({ length: rows }, () => Array.from({ length: cols }, () => []));
}
