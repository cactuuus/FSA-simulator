import { FSAGraph, Node, Transition } from '$lib/automata-models';

const SINK_LABEL = 'SINK';
const SINK_MARGIN = 200;

/**
 * Simpe helper to get the south-most state in the graph, used as reference when placing the new sink state.
 * @param fsa the FSA graph from which to get the lowest state
 * @return the lowest state in the graph
 */
function getLowestState(fsa: FSAGraph): Node {
	return fsa.nodes.reduce((lowest, node) => {
		if (node.pos.y > lowest.pos.y) {
			return node;
		}
		return lowest;
	}, fsa.nodes[0]);
}

/**
 * Returns a new FSA graph that is a complete version of the given one. It generates so by adding a new 'sink' state, then adding transitions from every state to the sink for every symbol in the alphabet that doesn't already have a transition, and finally adding self-loop transitions on the sink for every symbol in the alphabet.
 * If the given graph is already complete, it returns null.
 * NOTE: this function only works for DFAs and NFAs, it will throw an error on pushdown automata.
 * @param fsa the FSA graph to complete
 * @returns a new FSA graph that is a complete version of the given one, or null if the given graph is already complete
 */
export function toComplete(fsa: FSAGraph): FSAGraph | null {
	if (fsa.type !== 'DFA' && fsa.type !== 'NFA') {
		throw new Error('toComplete only works for DFAs and NFAs');
	}
	if (fsa.isComplete) {
		return null;
	}
	const complete = new FSAGraph();
	complete.loadFromJSON(fsa.toJSON());

	// place the sink state to the right of the existing states
	const refState = getLowestState(complete);
	const sinkState = new Node({ x: refState.pos.x, y: refState.pos.y + SINK_MARGIN }, SINK_LABEL);
	complete.addNode(sinkState);

	// add transitions from every state to the sink for every symbol in the alphabet that doesn't already have a transition (since SINK is already in the graph, this will also create the needed loopback transitions to itself)
	for (const node of complete.nodes) {
		const transitions = complete.adjacencyMap.get(node) ?? [];
		const outgoingSymbols = new Set(transitions.map(([transition]) => transition.consume));
		outgoingSymbols.delete(Transition.EPSILON); // ignore epsilon transitions
		const missingSymbols = [...complete.alphabet(false)]
			.filter((symbol) => !outgoingSymbols.has(symbol))
			.map((symbol) => new Transition(symbol));
		if (missingSymbols.length === 0) continue;
		// sink state is new so we don't have to worry about existing edges to it
		const newEdge = complete.createNewEdge(node, sinkState);
		newEdge.addTransitions(...missingSymbols);
	}

	return complete;
}
