import type { CanvasState, Node, Point } from '$lib/types';
import type { FSA } from '$lib/fsa/FSA.svelte';

export class SelectState implements CanvasState {
	readonly name = 'select';
	readonly cursor = 'pointer';

	private _draggedNode: Node | null = null;

	constructor(private _fsa: FSA) {}

	onExit() {
		this._draggedNode = null;
		this._fsa.unselectNode();
	}

	onMouseDown(pos: Point) {
		const clickedNode = this._fsa.getNodeAt(pos);

		if (clickedNode) {
			this._fsa.selectNode(clickedNode);
			this._draggedNode = clickedNode;
		} else {
			this._fsa.unselectNode();
		}
	}

	onMouseMove(pos: Point) {
		if (this._draggedNode) {
			this._fsa.updateNodePosition(this._draggedNode, pos);
		}
	}

	onMouseUp(pos: Point) {
		this._draggedNode = null;
	}
}
