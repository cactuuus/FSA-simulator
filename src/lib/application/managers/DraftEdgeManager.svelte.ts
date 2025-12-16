import type { Point } from '$lib/geometry';
import { DraftEdge, Edge, Node, type FSAGraph } from '$lib/automata/models';

export class DraftEdgeManager {
	private _draftEdge = $state<DraftEdge | null>(null);
	private _fsaGraph: FSAGraph;

	constructor(fsaGraph: FSAGraph) {
		this._fsaGraph = fsaGraph;
	}

	setDraftEdge(source: Node, target: Node) {
		const duplicateEdge = this._fsaGraph.edgeAlreadyExists(source, target);
		this._draftEdge = new DraftEdge(source, target, duplicateEdge);
	}

	updateDraftEdgeTarget(newTarget: Point | Node) {
		if (this._draftEdge) {
			let duplicateEdge = false;
			if (newTarget instanceof Node) {
				duplicateEdge = this._fsaGraph.edgeAlreadyExists(this._draftEdge.from, newTarget);
			}
			this._draftEdge.updateTarget(newTarget, duplicateEdge);
		}
	}

	commitDraftEdge(targetNode: Node): Edge | null {
		if (!this._draftEdge) {
			throw new Error('No draft edge to commit');
		}
		if (this._draftEdge.isDuplicate) {
			console.error('Cannot commit to a duplicate edge');
			return null;
		}
		return this._fsaGraph.addEdge(this._draftEdge.from, targetNode);
	}

	clearDraftEdge() {
		this._draftEdge = null;
	}

	get draftEdge(): DraftEdge | null {
		return this._draftEdge;
	}
}
