import type { Point } from '$lib/utils/geometry';
import { type FSAGraph, DraftEdge, Node } from '$lib/automata-models';

/**
 * Handler for managing the draft edge lifecycle.
 */
export class DraftEdgeHandler {
	private _draftEdge = $state<DraftEdge | null>(null);
	private _fsaGraph: FSAGraph;
	isDuplicate = $derived(this._draftEdge?.isDuplicate ?? false);

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
	 * Clears the state, removing any existing draft edge.
	 */
	clear() {
		this._draftEdge = null;
	}

	get get(): DraftEdge | null {
		return this._draftEdge;
	}
}
