import type { CanvasState } from '$lib/state-machine';
import type { Point, FSA, Node } from '$lib/fsa';

export class SelectState implements CanvasState {
	readonly name = 'select';
	readonly cursor = 'pointer';
	private _selectedNode: Node | null = null;
	private _isDragging: boolean = false;

	constructor(private _fsa: FSA) {}

	clearSelection() {
		this._selectedNode?.unselect();
		this._selectedNode = null;
	}

	onExit() {
		this.clearSelection();
	}

	onMouseDown(pos: Point) {
		this.clearSelection();
		this._selectedNode = this._fsa.getNodeAt(pos);
		this._selectedNode?.select();
		this._isDragging = true;
	}

	onMouseMove(pos: Point) {
		if (this._isDragging) {
			this._selectedNode?.moveTo(pos);
		}
	}

	onMouseUp(pos: Point): void {
		this._isDragging = false;
	}
}
