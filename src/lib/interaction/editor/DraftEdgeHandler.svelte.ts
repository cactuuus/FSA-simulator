import type { Point } from '$lib/geometry';
import { type FSAGraph, DraftEdge, Edge, Node } from '$lib/automata/models';

/**
 * Handler for managing the draft edge lifecycle.
 */
export class DraftEdgeHandler {
	private _draftEdge = $state<DraftEdge | null>(null);
	private _fsaGraph: FSAGraph;

	constructor(fsaGraph: FSAGraph) {
		this._fsaGraph = fsaGraph;
	}

	/**
	 * Creates a new draft edge.
	 * As it is currently implemented, the draft edge initially is drawn starting and ending at the same node, and is then updated to connect to a point or another node.
	 * @param node The source and target node of the draft edge.
	 */
	new(node: Node) {
		const isDuplicate = this._fsaGraph.edgeAlreadyExists(node, node);
		this._draftEdge = new DraftEdge(node, node, isDuplicate);
	}

	/**
	 * Updates the target of the draft edge.
	 * @param newTarget The new target of the draft edge, which can be a point or a node.
	 */
	updateTarget(newTarget: Point | Node) {
		if (this._draftEdge) {
			let isDuplicate = false;
			if (newTarget instanceof Node) {
				isDuplicate = this._fsaGraph.edgeAlreadyExists(this._draftEdge.from, newTarget);
			}
			this._draftEdge.updateTarget(newTarget, isDuplicate);
		}
	}

	/**
	 * If valid, commits the draft edge to the FSA graph, creating a new edge from the draft edge's source to the specified target node.
	 * @param targetNode The target node to which the draft edge should connect.
	 * @returns The newly created edge if the commit is successful, or null if the draft edge is not valid.
	 */
	commit(targetNode: Node): Edge | null {
		if (!this._draftEdge) {
			throw new Error('No draft edge to commit');
		}
		if (this._draftEdge.isDuplicate) {
			console.error('Cannot commit to a duplicate edge');
			return null;
		}
		return this._fsaGraph.addEdge(this._draftEdge.from, targetNode);
	}

	/**
	 * Clears the state, removing any existing draft edge.
	 */
	clear() {
		this._draftEdge = null;
	}

	get get(): DraftEdge | null {
		return this._draftEdge;
	}
}
