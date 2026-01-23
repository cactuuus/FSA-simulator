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
	states: Node[];
	inputs: InputSymbol[];
	content: TransitionOutput[][][];
}

/**
 * Represents uniques combinations of input symbols and pop stack operations. Used as the columns of the transition table. For non-PDAs, only the consume symbol is used.
 * It also provides a collection of	transition IDs that share the same input symbols.
 */
export class InputSymbol {
	readonly consume: string;
	readonly pop?: string;
	transitions: Set<Transition>;

	constructor(transition: Transition) {
		this.consume = transition.consume;
		this.pop = transition.pop ?? undefined;
		this.transitions = new Set([transition]);
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

	toString(): string {
		return this.pop ? `${this.consume},${this.pop}` : this.consume;
	}
}

/**
 * Simple interface representing the output of a transition in the transition table (basically the content of each cell). Along with the target state label, the entire transition is passed, for simplicity.
 */
export interface TransitionOutput {
	transition: Transition;
	targetState: Node;
}

/**
 * Generates the transition table for the given FSA.
 * @param fsa The FSA graph.
 * @returns The corresponding transition table.
 */
export function getTransitionTable(fsa: FSAGraph): TransitionTable {
	const states = fsa.nodes.sort((a, b) => a.label.localeCompare(b.label));
	const inputs = getInputSymbols(fsa);
	const content = emptyTransitionMatrix(states.length, inputs.length);

	// for quick lookup of symbol index (aka column index)
	const symbolIndex = new Map<string, number>();
	inputs.forEach((symbol, index) => symbolIndex.set(symbol.toString(), index));

	states.forEach((node, row) => {
		const outgoingEdges = fsa.edgesBySource.get(node.id) ?? [];
		outgoingEdges.forEach((edge) => {
			edge.transitions.forEach((transition) => {
				const targetState = edge.to;
				const inputSymbol = new InputSymbol(transition);
				const col = symbolIndex.get(inputSymbol.toString())!;
				content[row][col].push({ transition, targetState });
			});
		});
	});
	return { states, inputs, content };
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
			const inputSymbol = new InputSymbol(transition);
			const existing = symbols.get(inputSymbol.toString());
			if (existing) {
				existing.transitions.add(transition);
			} else {
				symbols.set(inputSymbol.toString(), inputSymbol);
			}
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
function emptyTransitionMatrix(rows: number, cols: number): TransitionOutput[][][] {
	return Array.from({ length: rows }, () => Array.from({ length: cols }, () => []));
}
