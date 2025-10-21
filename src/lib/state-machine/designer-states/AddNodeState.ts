import type { CanvasState, Point } from '$lib/types';
import type { FSA } from '$lib/fsa/FSA.svelte';

export class AddNodeState implements CanvasState {
	readonly name = 'add-node';
	readonly cursor = 'copy';

	onClick(pos: Point, fsa: FSA) {
		fsa.addNode(pos);
	}
}
