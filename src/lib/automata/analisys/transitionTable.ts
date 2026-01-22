import { FSAGraph, Node, Transition } from '$lib/automata/models';

/**
 * Represents a transition table for an FSA without stack operations (basically DFA & NFA).
 * - states: list of state labels (rows).
 * - inputs: list of input symbols (representing the FSA state needed for the transition) (columns).
 * - content: 3D array where content[i][j] is a list of target state labels reachable from state i on input j.
 *
 * For FSAs with stack operations (PDAs), the input symbols also include stack pop operations, and content[i][j] includes push operations.
 */
export interface TransitionTable {
	states: string[];
	inputs: InputSymbol[];
	content: string[][][];
}

/**
 * Represents an input symbol, possibly paired with a stack operation.
 * Mostly made as a helper for abstracting information about transitions in both PDA and non-PDA FSAs.
 */
export class InputSymbol {
	readonly consume: string;
	readonly pop?: string;

	constructor(consume: string, pop?: string) {
		this.consume = consume;
		this.pop = pop;
	}

	compare(other: InputSymbol): number {
		if (this.consume === Transition.EPSILON && other.consume !== Transition.EPSILON) return 1;
		if (other.consume === Transition.EPSILON && this.consume !== Transition.EPSILON) return -1;
		const consumeComparison = this.consume.localeCompare(other.consume);
		if (consumeComparison !== 0) return consumeComparison;
		return (this.pop ?? '').localeCompare(other.pop ?? '');
	}

	static sort(symbols: Iterable<InputSymbol>): InputSymbol[] {
		return Array.from(symbols).sort((a, b) => a.compare(b));
	}

	static fromTransition(transition: Transition): InputSymbol {
		return new InputSymbol(transition.consume, transition.pop ?? undefined);
	}

	toString(): string {
		return this.pop ? `${this.consume},${this.pop}` : this.consume;
	}
}

/**
 * Generates the transition table for the given FSA.
 * @param fsa The FSA graph.
 * @returns The corresponding transition table.
 */
export function getTransitionTable(fsa: FSAGraph) {
	const { uniqueLabels, sortedNodes } = labelAndSortNodes(fsa.nodes);
	const states = sortedNodes.map((node) => {
		let label = uniqueLabels.get(node.id)!;
		if (node.isAccepting) label = `[${label}]`;
		if (node.id === fsa.startNode?.id) label = `→ ${label}`;
		return `${label}`;
	});
	const inputs = getInputSymbols(fsa);
	const content = emptyTransitionMatrix(states.length, inputs.length);

	// for quick lookup of symbol index (aka column index)
	const symbolIndex = new Map<string, number>();
	inputs.forEach((symbol, index) => symbolIndex.set(symbol.toString(), index));

	sortedNodes.forEach((node, row) => {
		const outgoingEdges = fsa.edgesBySource.get(node.id) ?? [];
		outgoingEdges.forEach((edge) => {
			edge.transitions.forEach((transition) => {
				const targetLabel = uniqueLabels.get(edge.to.id)!;
				const inputSymbol = new InputSymbol(transition.consume, transition.pop ?? undefined);
				const col = symbolIndex.get(inputSymbol.toString())!;

				content[row][col].push(fsa.hasStackOps ? `${transition.push},${targetLabel}` : targetLabel);
			});
		});
	});
	return { states, inputs, content };
}

/**
 * Generates unique labels for the given nodes and returns them sorted by their newly assigned uniquelabels.
 * @param nodes The list of nodes to organise.
 * @returns An object containing:
 *  - uniqueLabels: A map from node IDs to their unique labels.
 *  - sortedNodes: The list of nodes sorted by their unique labels.
 */
function labelAndSortNodes(nodes: Node[]): {
	uniqueLabels: Map<string, string>;
	sortedNodes: Node[];
} {
	const uniqueLabels = nodeIdToLabelMap(nodes);
	const sortedNodes = [...nodes].sort((a, b) => {
		const labelA = uniqueLabels.get(a.id)!;
		const labelB = uniqueLabels.get(b.id)!;
		return labelA.localeCompare(labelB);
	});
	return { uniqueLabels, sortedNodes };
}

/**
 * Generates a map from node IDs to unique labels.
 * If multiple nodes share the same label, a suffix is added to make them unique (aka "q0" and "q0 (1)").
 * @param nodes The list of nodes in the FSA.
 * @returns A map from node IDs to their unique labels.
 */
function nodeIdToLabelMap(nodes: Node[]): Map<string, string> {
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
 * Extracts and sorts the unique input symbols from the FSA's transitions.
 * @param fsa The FSA graph.
 * @returns A sorted array of unique input symbols.
 */
function getInputSymbols(fsa: FSAGraph): InputSymbol[] {
	const symbols = new Map<string, InputSymbol>();
	fsa.edges.forEach((edge) => {
		edge.transitions.forEach((transition) => {
			const inputSymbol = InputSymbol.fromTransition(transition);
			symbols.set(inputSymbol.toString(), inputSymbol);
		});
	});
	return InputSymbol.sort(symbols.values());
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
