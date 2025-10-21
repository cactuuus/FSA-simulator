import type { CanvasState, Node, Point } from '$lib/types';
import type { FSA } from '$lib/fsa/FSA.svelte';

export class DrawEdgeState implements CanvasState {
	readonly name = 'draw-edge';
	readonly cursor = 'crosshair';

	private _sourceNode: Node | null = null;

	onExit(fsa: FSA) {
		this._sourceNode = null;
		fsa.clearDraftEdge();
	}

	onMouseDown(pos: Point, fsa: FSA) {
		const clickedNode = fsa.getNodeAt(pos);
		if (clickedNode) {
			this._sourceNode = clickedNode;
		}
	}

	onMouseMove(pos: Point, fsa: FSA) {
		if (this._sourceNode) {
			fsa.setDraftEdge(this._sourceNode, pos);
		}
	}

	onMouseUp(pos: Point, fsa: FSA): void {
		const targetNode = fsa.getNodeAt(pos);
		if (this._sourceNode && targetNode) {
			fsa.addEdge(this._sourceNode, targetNode);
		}
		this._sourceNode = null;
		fsa.clearDraftEdge();
	}
}
