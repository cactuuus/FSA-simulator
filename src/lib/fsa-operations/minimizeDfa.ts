import { FSAGraph, Edge } from '$lib/automata-models';
import { toDefaultLayout } from '$lib/utils/graphLayout';
import { UnionFind } from '$lib/utils/UnionFind';

/**
 * Traverses and modifies the given DFA in place to remove unreachable states.
 * @param dfa The DFA graph from which to remove unreachable states.
 */
function removeUnreachableStates(dfa: FSAGraph): void {
	if (!dfa.startNode) return;
	const reachable = new Set<string>();
	reachable.add(dfa.startNode.id);
	const queue = [dfa.startNode];
	while (queue.length > 0) {
		const current = queue.shift()!;
		for (const [, target] of dfa.adjacencyMap.get(current) ?? []) {
			if (!reachable.has(target.id)) {
				reachable.add(target.id);
				queue.push(target);
			}
		}
	}
	dfa.nodes.filter((node) => !reachable.has(node.id)).forEach((node) => dfa.deleteNode(node.id));
}

/**
 * Encodes a pair of state IDs into a consistent string format for use in sets and maps.
 * The order of 'a' and 'b' does not affect the encoding, so encodePair('A', 'B') and encodePair('B', 'A') will produce the same result.
 * @param a The first state's ID.
 * @param b The second state's ID.
 * @returns A string encoding of the pair.
 */
function encodePair(a: string, b: string): string {
	return a < b ? `${a},${b}` : `${b},${a}`;
}

/**
 * Builds a simple transition table for the given DFA. This has the form of 'nodeId : (symbol: targetId)'.
 * Beware: This only really works for DFAs as it currently is, as it expects a single target per transition. In an NFA, entries in the map might be overridden by transitions using the same symbol.
 * @param fsa The DFA for which to build the transition table.
 * @returns A mapping of node IDs to their outgoing transitions, where each transition maps an input symbol to a target node ID.
 */
function transitionTable(dfa: FSAGraph): Map<string, Map<string, string>> {
	const table = new Map<string, Map<string, string>>();
	for (const node of dfa.nodes) {
		const symbolMap = new Map<string, string>();
		for (const [transition, target] of dfa.adjacencyMap.get(node) ?? []) {
			symbolMap.set(transition.consume, target.id);
		}
		table.set(node.id, symbolMap);
	}
	return table;
}

/**
 * Traverses and modifies the given DFA in place to merge indistinguishable states (i.e., states that have the same behavior for all input strings) using the table-filling algorithm.
 * Note: easy to grasp explanation https://www.youtube.com/watch?v=7W2lSrt8r-0
 * Interesting question about handling non-complete DFAs: https://stackoverflow.com/questions/71851094/when-minimizing-dfas-through-table-fill-should-a-pair-of-final-states-transitio
 * @param dfa The DFA graph from which to merge indistinguishable states.
 */
function mergeIndistinguishableStates(dfa: FSAGraph): void {
	const nodes = dfa.nodes;
	const alphabet = [...dfa.alphabet()];
	const startNodeId = dfa.startNode?.id ?? null;
	const table = transitionTable(dfa); // nodeId : (symbol: targetId)
	const DEAD_END = '__DEAD_END__'; // special marker for missing transitions (non-complete DFAs)

	// mark pairs made up of one accepting and one non-accepting state as distinguishable
	const distinguishable = new Set<string>();
	for (let i = 0; i < nodes.length; i++) {
		const nodeA = nodes[i];
		for (let j = i + 1; j < nodes.length; j++) {
			const nodeB = nodes[j];
			if (nodeA.isAccepting !== nodeB.isAccepting) {
				distinguishable.add(encodePair(nodeA.id, nodeB.id));
			}
		}
	}

	// loop until no new pairs are marked as distinguishable
	let changed = true;
	while (changed) {
		changed = false;
		for (let i = 0; i < nodes.length; i++) {
			const nodeA = nodes[i];
			for (let j = i + 1; j < nodes.length; j++) {
				const nodeB = nodes[j];
				const pair = encodePair(nodeA.id, nodeB.id);
				if (distinguishable.has(pair)) continue;

				for (const symbol of alphabet) {
					const reachedViaA = table.get(nodeA.id)?.get(symbol) ?? DEAD_END;
					const reachedViaB = table.get(nodeB.id)?.get(symbol) ?? DEAD_END;
					if (reachedViaA === reachedViaB) continue; // indistinguishable on this symbol
					if (
						reachedViaA === DEAD_END ||
						reachedViaB === DEAD_END ||
						distinguishable.has(encodePair(reachedViaA, reachedViaB))
					) {
						distinguishable.add(pair);
						changed = true;
						break;
					}
				}
			}
		}
	}

	// group indistinguishable states
	const unionFind = new UnionFind();
	for (let i = 0; i < nodes.length; i++) {
		const nodeA = nodes[i];
		for (let j = i + 1; j < nodes.length; j++) {
			const nodeB = nodes[j];
			const pair = encodePair(nodeA.id, nodeB.id);
			if (!distinguishable.has(pair)) {
				unionFind.union(nodeA.id, nodeB.id);
			}
		}
	}

	// redirect edges and delete merged states
	for (const [repId, members] of unionFind.groups()) {
		const rep = dfa.requireNode(repId);
		const mergedLabels = members.map((id) => dfa.requireNode(id).label).join(',');
		rep.label = `{${mergedLabels}}`;
		for (const nodeId of members) {
			if (nodeId === repId) continue;
			// redirect incoming edges to the representative
			const incoming = dfa.edges.filter((edge) => edge.to.id === nodeId);
			for (const originalEdge of incoming) {
				// if the edge is a self loop on the merged node, redirect it to the representative
				const fromNode = originalEdge.from.id === nodeId ? rep : originalEdge.from;
				const newEdgeId = Edge.createId(fromNode.id, rep.id);
				if (dfa.getEdge(newEdgeId) === null) dfa.addEdge(new Edge(fromNode, rep));
				const newEdge = dfa.requireEdge(newEdgeId);
				const existingSymbols = new Set(newEdge.transitions.map((t) => t.consume));
				const newTransitions = originalEdge.transitions.filter(
					(t) => !existingSymbols.has(t.consume)
				);
				if (newTransitions.length > 0) {
					newEdge.addTransitions(...newTransitions);
				}
				dfa.deleteEdge(originalEdge.id);
			}
			// delete the merged node
			dfa.deleteNode(nodeId);
		}
	}

	// update start node (which could potentially have been merged and deleted)
	if (startNodeId) {
		const rep = unionFind.find(startNodeId);
		dfa.startNode = dfa.requireNode(rep);
	}
}

/**
 * Minimizes the given DFA, returning a new DFA that is equivalent but has the minimum number of states.
 * @param dfa The DFA graph to minimize. Must have a defined start node.
 * @returns A new minimized DFA graph equivalent to the given DFA.
 */
export function minimizeDfa(dfa: FSAGraph): FSAGraph | null {
	const minimized = new FSAGraph();
	minimized.loadFromJSON(dfa.toJSON());
	removeUnreachableStates(minimized);
	mergeIndistinguishableStates(minimized);

	// if nothing is changed, return null as a clear 'we didn't do anything' signal
	if (minimized.nodes.length === dfa.nodes.length && minimized.edges.length === dfa.edges.length) {
		return null;
	}

	toDefaultLayout(minimized);
	return minimized;
}
