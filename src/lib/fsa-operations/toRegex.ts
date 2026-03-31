import { FSAGraph, FSAType, type Node, type Transition } from '$lib/automata-models';
import { NfaToDfa } from './nfaToDfa';
import { minimizeDfa } from './minimizeDfa';

const EMPTY_SET_REGEX = '∅';
const EMPTY_LABEL = '';

/**
 * Very simple helper, used purely to be more explicit about the intent of what we're checking in the rest of the script.
 * @param label The regex/transition label to check
 * @returns true if the label is empty, false otherwise
 */
function isEmpty(label: string): boolean {
	return label === EMPTY_LABEL;
}

/**
 * Wraps an expression in parentheses if it contains a top-level union operator (|). Used when the expression appears in a concatenation context.
 * @param expr The regex expression to potentially wrap
 * @return The original expression, or the expression wrapped in parentheses if it contains a top-level union operator
 */
function wrapForUnion(expr: string): string {
	if (expr.length === 0) return EMPTY_LABEL;
	let depth = 0;
	for (const char of expr) {
		if (char === '(') depth++;
		else if (char === ')') depth--;
		else if (char === '|' && depth === 0) return `(${expr})`;
	}
	return expr;
}

/**
 * Wraps an expression in parentheses if it is more than a single character and not already wrapped. Used when the expression appears as the operand of * or ?.
 * @param expr The regex expression to potentially wrap
 * @return The original expression, or the expression wrapped in parentheses if it is more than a single character and not already wrapped
 */
function wrapForPostfix(expr: string): string {
	if (expr.length === 0) return EMPTY_LABEL;
	if (expr.length === 1) return expr;
	if (!expr.startsWith('(') || !expr.endsWith(')')) return `(${expr})`;
	let depth = 0;
	// we stop before the last character to avoid counting a potentially wrapping parenthesis at the end
	for (let i = 0; i < expr.length - 1; i++) {
		if (expr[i] === '(') depth++;
		else if (expr[i] === ')') depth--;
		if (depth === 0) return `(${expr})`;
	}
	return expr;
}

/**
 * Computes the new regex label for edge P->S after eliminating state Q. Here P is a predecessor of Q, S is a successor of Q, and Q is the state being eliminated.
 * The new label is computed based on the existing labels on edges P->Q, Q->Q, Q->S, and P->S (if they exist), with the general idea being something like "rPS' = rPQ (rQQ)* rQS | rPS" (this of course depends on existing values of each of these variables).
 * @param rPQ regex label on edge P->Q (null if that doesn't exist)
 * @param rQQ regex label on loopback edge Q->Q (null if that doesn't exist)
 * @param rQS regex label on edge Q->S (null if that doesn't exist)
 * @param rPS existing regex label on edge P->S (null if that doesn't exist)
 */
function computeRegexLabel(
	rPQ: string | null,
	rQQ: string | null,
	rQS: string | null,
	rPS: string | null
): string | null {
	// check that Q is indeed an intermediate state between P and S
	if (rPQ === null || rQS === null) return rPS;

	const left = wrapForUnion(rPQ);
	const selfloop = rQQ !== null ? `${wrapForPostfix(rQQ)}*` : EMPTY_LABEL;
	const right = wrapForUnion(rQS);
	const newPtoS = `${left}${selfloop}${right}`;

	if (rPS === null) return newPtoS; // transition P->S doesn't yet exists, so we return the new P->S
	if (isEmpty(rPS) && isEmpty(newPtoS)) return EMPTY_LABEL;
	if (isEmpty(rPS) && !isEmpty(newPtoS)) return `${wrapForPostfix(newPtoS)}?`;
	if (!isEmpty(rPS) && isEmpty(newPtoS)) return `${wrapForPostfix(rPS)}?`;
	return `${newPtoS}|${rPS}`; // both existing and new P->S transitions are non-epsilon, so we combine them
}

/**
 * Sorts states by total connection count (incoming + outgoing) in ascending order, returning their sorted IDs.
 * @param nodes The list of nodes to sort
 * @param adjacencyMap The adjacency map of the graph, used to count connections.
 * @returns The list of node IDs sorted by connection count.
 */
function sortByConnections(nodes: Node[], adjacencyMap: Map<Node, [Transition, Node][]>): string[] {
	const connections = new Map<string, number>();
	for (const [source, targets] of adjacencyMap) {
		for (const [, target] of targets) {
			connections.set(source.id, (connections.get(source.id) ?? 0) + 1);
			connections.set(target.id, (connections.get(target.id) ?? 0) + 1);
			// NOTE: currently, a loopback edge counts as both incoming and outgoing (so it is a +2), it could be reduced to a +1. In my tests, it didn't make any difference, but worth noting.
		}
	}
	return nodes
		.map((n) => n.id)
		.sort((a, b) => (connections.get(a) ?? 0) - (connections.get(b) ?? 0));
}

/**
 * Class representing a generalized NFA (GNFA), a special FSA where edges are labelled with regexes instead of symbols.
 * We use this to convert a DFA to a regex using a state elimination method. The process is roughly:
 * 1. We add a new start state and connect it to the old start state with an epsilon transition.
 * 2. We add a new accept state and connect all old accept states to it with epsilon transitions, then turn those old accept states into non-accepting.
 * 3. We repeatedly eliminate the original DFA states, until only the new start and accept states remain, updating the regex labels on edges as we go.
 * 4. Once only the new start and accept states remain, the label on the edge between them (if it exists) is the resulting regex.
 *
 * NOTE: we don't actually use epsilon symbols but just empty string instead, which simply leads to a simpler regex.
 *
 * see https://stackoverflow.com/questions/53608410/state-elimination-dfa-to-regular-expression
 */
class GNFA {
	private map = new Map<string, Map<string, string>>();
	private readonly newStart = '__START__';
	private readonly newAccept = '__ACCEPT__';
	private readonly statesToEliminate: string[];

	constructor(dfa: FSAGraph) {
		// setup new start and accept states (we make them empty rather than epsilon to avoid extra complexity with the resulting regex)
		this.setRegexLabel(this.newStart, dfa.startNode!.id, EMPTY_LABEL);
		dfa.nodes.forEach((node) => {
			if (node.isAccepting) this.setRegexLabel(node.id, this.newAccept, EMPTY_LABEL);
		});

		// pre-processing of transitions -- merge multiple symbols on same edge with |
		for (const edge of dfa.edges) {
			const label = edge.transitions
				.map((t) => (t.consume.length === 1 ? t.consume : `(${t.consume})`))
				.join('|');
			this.setRegexLabel(edge.from.id, edge.to.id, label);
		}

		// states to eliminate, we sort them in order to process less connected nodes (incoming + outgoing edges) first, which hopefully should lead to a simpler regex
		this.statesToEliminate = sortByConnections(dfa.nodes, dfa.adjacencyMap);
	}

	/**
	 * Gets the regex label on the edge from "from" to "to", or null if that edge doesn't exist.
	 * @param from The source state ID
	 * @param to The target state ID
	 * @returns The regex label on the edge from "from" to "to", or null if that edge doesn't exist.
	 */
	private getRegexLabel(from: string, to: string): string | null {
		return this.map.get(from)?.get(to) ?? null;
	}

	/**
	 * Sets the regex label on the edge from "from" to "to".
	 * @param from The source state ID
	 * @param to The target state ID
	 * @param label The regex label to set
	 */
	private setRegexLabel(from: string, to: string, label: string): void {
		if (!this.map.has(from)) {
			this.map.set(from, new Map());
		}
		this.map.get(from)!.set(to, label);
	}

	/**
	 * Deletes all regex labels on edges to and from the given state, effectively removing it from the graph.
	 * @param state The state ID for which to delete regex labels.
	 */
	private deleteRegexLabelsToAndFrom(state: string): void {
		this.map.delete(state);
		for (const row of this.map.values()) {
			row.delete(state);
		}
	}

	/**
	 * Eliminates the given state from the graph, updating regex labels on edges as necessary.
	 * @param toEliminate The state ID of the state to eliminate.
	 * @param allStates The list of all state IDs currently in the graph, used to find predecessors and successors of the eliminated state.
	 */
	private eliminateState(toEliminate: string, allStates: string[]): void {
		const rQQ = this.getRegexLabel(toEliminate, toEliminate);
		for (const p of allStates) {
			const rPQ = this.getRegexLabel(p, toEliminate);
			// skip if p in not a predecessor of the eliminated node, or if p itself is the node being eliminated
			if (p === toEliminate || rPQ === null) continue;
			for (const s of allStates) {
				const rQS = this.getRegexLabel(toEliminate, s);
				// similarly, skip if s is not a successor of the eliminated node, or if s itself is the node being eliminated
				if (s === toEliminate || rQS === null) continue;
				const rPS = this.getRegexLabel(p, s);
				const newLabel = computeRegexLabel(rPQ, rQQ, rQS, rPS);
				if (newLabel !== null) this.setRegexLabel(p, s, newLabel);
			}
		}
		this.deleteRegexLabelsToAndFrom(toEliminate);
	}

	/**
	 * Eliminates all intermediate states until only the new start and accept states remain, then returns the regex label on the edge between them (or ∅ if that edge doesn't exist).
	 * @returns The regex equivalent to the original DFA.
	 */
	solve(): string {
		const allStates = [this.newStart, ...this.statesToEliminate, this.newAccept];
		for (const state of this.statesToEliminate) {
			this.eliminateState(state, allStates);
			allStates.splice(allStates.indexOf(state), 1);
		}
		return this.getRegexLabel(this.newStart, this.newAccept) ?? EMPTY_SET_REGEX;
	}
}

/**
 * Converts an FSA to an equivalent regular expression using the state elimination method.
 * NFAs are first converted to DFAs, and the DFA is minimized before conversion.
 * @throws if the FSA has stack operations (PDAs are not supported)
 * @throws if the FSA has no start node
 */
export function toRegex(fsa: FSAGraph): string {
	if (fsa.hasStackOps) throw new Error('toRegex: PDAs cannot be converted to regex');
	if (!fsa.startNode) throw new Error('toRegex: FSA has no start node');

	let dfa = fsa.type === FSAType.NFA ? NfaToDfa(fsa) : fsa;
	dfa = minimizeDfa(dfa) ?? dfa;
	// if there are no accepting states to begin with, we can immediately return the empty set regex
	if (!dfa.nodes.some((n) => n.isAccepting)) return EMPTY_SET_REGEX;

	return new GNFA(dfa).solve();
}
