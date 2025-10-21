import type { CanvasState } from '$lib/state-machine';
import type { Point, FSA } from '$lib/fsa';

export class AddNodeState implements CanvasState {
	readonly name = 'add-node';
	readonly cursor = 'copy';

	constructor(private _fsa: FSA) {}

	onClick(pos: Point) {
		const emptySpace = this._fsa.getNodeAt(pos) === null;
		if (emptySpace) {
			this._fsa.addNode(pos);
		}
	}
}
