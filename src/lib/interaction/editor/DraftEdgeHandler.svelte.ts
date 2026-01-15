import type { Point } from '$lib/geometry';
import { type FSAGraph, DraftEdge, Edge, Node } from '$lib/automata/models';

export class DraftEdgeHandler {
	private _draftEdge = $state<DraftEdge | null>(null);
	private _fsaGraph: FSAGraph;

	constructor(fsaGraph: FSAGraph) {
		this._fsaGraph = fsaGraph;
	}

	new(source: Node, target: Node) {
		const isDuplicate = this._fsaGraph.edgeAlreadyExists(source, target);
		this._draftEdge = new DraftEdge(source, target, isDuplicate);
	}

	updateTarget(newTarget: Point | Node) {
		if (this._draftEdge) {
			let isDuplicate = false;
			if (newTarget instanceof Node) {
				isDuplicate = this._fsaGraph.edgeAlreadyExists(this._draftEdge.from, newTarget);
			}
			this._draftEdge.updateTarget(newTarget, isDuplicate);
		}
	}

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

	clear() {
		this._draftEdge = null;
	}

	get draftEdge(): DraftEdge | null {
		return this._draftEdge;
	}
}
