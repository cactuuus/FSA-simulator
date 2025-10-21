import type { CanvasState } from '$lib/state-machine';
import type { Point, FSA, Node } from '$lib/fsa';

export class DrawEdgeState implements CanvasState {
	readonly name = 'draw-edge';
	readonly cursor = 'crosshair';
	private _sourceNode: Node | null = null;

	constructor(private _fsa: FSA) {}

	onExit() {
		this._sourceNode = null;
		this._fsa.clearDraftEdge();
	}

	onMouseDown(pos: Point) {
		const clickedNode = this._fsa.getNodeAt(pos);
		if (clickedNode) {
			this._sourceNode = clickedNode;
		}
	}

	onMouseMove(pos: Point) {
		if (this._sourceNode) {
			this._fsa.setDraftEdge(this._sourceNode, pos);
		}
	}

	onMouseUp(pos: Point): void {
		const targetNode = this._fsa.getNodeAt(pos);
		if (this._sourceNode && targetNode) {
			this._fsa.addEdge(this._sourceNode, targetNode);
		}
		this._sourceNode = null;
		this._fsa.clearDraftEdge();
	}
}
