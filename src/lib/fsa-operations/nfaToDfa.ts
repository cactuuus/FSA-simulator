import { FSAGraph, Node, Transition, Edge, FSAType } from '$lib/automata-models';
import { toDefaultLayout } from '$lib/utils/graphLayout';

/**
 * Encodes a set of states into a string based on their IDs (useful for hashing).
 * @param states The list of states to encode.
 * @returns A string representation of the set of states, separated by commas.
 */
function encodeStateSet(states: Set<Node>): string {
	return [...states]
		.map((s) => s.id)
		.sort()
		.join(',');
}

/**
 * Generates a new label for a set of states by concatenating their labels. If the set is empty, it returns the symbol for the empty set (∅).
 * @param states The list of states to label.
 * @returns A string representation of the set of states, separated by commas and enclosed in curly braces.
 */
function stateSetLabel(states: Set<Node>): string {
	if (states.size === 0) return '{∅}';
	return `{${[...states]
		.map((s) => s.label)
		.sort()
		.join(',')}}`;
}

/**
 * Computes the epsilon closure of a given state.
 * @param startingState The state for which to compute the epsilon closure.
 * @param adjacencyMap The adjacency map of the NFA, mapping each state to its outgoing transitions and target states.
 * @returns A set of states that are reachable from the starting state via epsilon transitions.
 */
function epsilonClosure(
	startingState: Node,
	adjacencyMap: Map<Node, [Transition, Node][]>
): Set<Node> {
	const closure = new Set<Node>([startingState]);
	const activeStates = [startingState];
	while (activeStates.length > 0) {
		const current = activeStates.pop()!;
		const neighbours = adjacencyMap.get(current) ?? [];
		for (const [transition, target] of neighbours) {
			if (transition.consume === Transition.EPSILON && !closure.has(target)) {
				closure.add(target);
				activeStates.push(target);
			}
		}
	}
	return closure;
}

/**
 * Computes the epsilon closures for all states in an FSA.
 * @param fsa The FSA for which to compute the closures.
 * @returns A map from each state to its epsilon closure (as a set of states).
 */
function closuresMap(fsa: FSAGraph): Map<Node, Set<Node>> {
	const closures = new Map<Node, Set<Node>>();
	for (const state of fsa.nodes) {
		closures.set(state, epsilonClosure(state, fsa.adjacencyMap));
	}
	return closures;
}

/**
 * Given a set of states and a map of their epsilon closures, it combines all the states' closures together into a single set.
 * @param states The set of states for which to compute the union of closures.
 * @param closures A map from each state to its epsilon closure (as a set of states).
 * @returns A set of states that is the union of the closures of the given states.
 */
function closureUnion(states: Set<Node>, closures: Map<Node, Set<Node>>): Set<Node> {
	const union = new Set<Node>();
	for (const state of states) {
		for (const s of closures.get(state)!) {
			union.add(s);
		}
	}
	return union;
}

/**
 * Given a set of states, a symbol, and an adjacency map, it computes the set of states that can be reached from any of the given states by consuming the symbol.
 * @param states The set of states from which to start.
 * @param symbol The symbol to consume.
 * @param adjacencyMap The mapping of each state and its outgoing transitions and target states.
 * @returns A set of states that can be reached from the given states by consuming the given symbol.
 */
function consumeSymbol(
	states: Set<Node>,
	symbol: string,
	adjacencyMap: Map<Node, [Transition, Node][]>
): Set<Node> {
	const result = new Set<Node>();
	for (const state of states) {
		const neighbours = adjacencyMap.get(state) ?? [];
		for (const [transition, target] of neighbours) {
			if (transition.consume === symbol) {
				result.add(target);
			}
		}
	}
	return result;
}

/**
 * Generates the power set of a given list of nodes, which represents all possible subsets of states.
 * @param nodes The list of nodes for which to generate the power set.
 * @returns An array of sets, where each set is a subset of the input nodes.
 */
function powerSet(nodes: Node[]): Set<Node>[] {
	const result: Set<Node>[] = [new Set()];
	for (const node of nodes) {
		const newSubsets = result.map((subset) => {
			const newSubset = new Set(subset);
			newSubset.add(node);
			return newSubset;
		});
		result.push(...newSubsets);
	}
	return result;
}

/**
 * Converts a NFA to an equivalent DFA.
 * @param nfa The NFA to convert. Must have a defined start node.
 * @returns A (complete) DFA which is equivalent to the given NFA.
 */
export function NfaToDfa(nfa: FSAGraph): FSAGraph {
	if (nfa.type !== FSAType.NFA) {
		throw new Error('NfaToDfa: input must be an NFA');
	}
	if (!nfa.startNode) {
		throw new Error('NfaToDfa: NFA has no start node');
	}

	const dfa = new FSAGraph();
	const nfaClosures = closuresMap(nfa);
	const NfaStatesSubsets = powerSet(nfa.nodes);
	const subsetToDfaState = new Map<string, Node>();
	const nfaAdjacencyMap = nfa.adjacencyMap;

	// create a DFA node for every subset
	for (const subset of NfaStatesSubsets) {
		const label = stateSetLabel(subset);
		const isAccepting = [...subset].some((state) => state.isAccepting);
		// positions are tidied up later, using toDefaultLayout
		const node = new Node({ x: 0, y: 0 }, label, isAccepting);
		dfa.addNode(node);
		subsetToDfaState.set(encodeStateSet(subset), node);
	}

	// set start node (epsilon closure of NFA start state)
	const startClosure = nfaClosures.get(nfa.startNode)!;
	dfa.startNode = subsetToDfaState.get(encodeStateSet(startClosure))!;

	// fill in transitions for every subset and every symbol
	for (const subset of NfaStatesSubsets) {
		const fromNode = subsetToDfaState.get(encodeStateSet(subset))!;
		for (const symbol of nfa.alphabet(false)) {
			const reached = consumeSymbol(subset, symbol, nfaAdjacencyMap);
			const reachedClosure = closureUnion(reached, nfaClosures);
			const toNode = subsetToDfaState.get(encodeStateSet(reachedClosure))!;

			const edgeId = Edge.createId(fromNode.id, toNode.id);
			if (dfa.getEdge(edgeId) === null) {
				dfa.addEdge(new Edge(fromNode, toNode));
			}
			const edge = dfa.requireEdge(edgeId);
			edge.addTransitions(new Transition(symbol, null, null));
		}
	}

	toDefaultLayout(dfa);
	return dfa;
}
