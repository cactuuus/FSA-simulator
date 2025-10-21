import type { CanvasState, Node, Point } from '$lib/types';
import type { FSA } from '$lib/fsa/FSA.svelte';

export class SelectState implements CanvasState {
	readonly name = 'select';
	readonly cursor = 'pointer';

	private _draggedNode: Node | null = null;

	onExit(fsa: FSA) {
		this._draggedNode = null;
		fsa.unselectNode();
	}

	onMouseDown(pos: Point, fsa: FSA) {
		const clickedNode = fsa.getNodeAt(pos);

		if (clickedNode) {
			fsa.selectNode(clickedNode);
			this._draggedNode = clickedNode;
		} else {
			fsa.unselectNode();
		}
	}

	onMouseMove(pos: Point, fsa: FSA) {
		if (this._draggedNode) {
			fsa.updateNodePosition(this._draggedNode, pos);
		}
	}

	onMouseUp(pos: Point, fsa: FSA) {
		this._draggedNode = null;
	}
}
