import type { Point } from '$lib/utils/geometry';
import type { BaseEdge } from './types';
import { Node } from './Node.svelte';

/**
 * Represents a temporary edge being drawn on the canvas. Used purely for visual feedback during
 * edge creation before the actual edge is drawn.
 */
export class DraftEdge implements BaseEdge {
	readonly from: Node;
	private _to = $state<Point | Node>({ x: 0, y: 0 });
	private _pointingAtNode = $state<boolean>(false);
	private _isDuplicate = $state<boolean>(false);

	constructor(from: Node, to: Point | Node, isDuplicate: boolean) {
		this.from = from;
		this._to = to;
		this._pointingAtNode = to instanceof Node;
		this._isDuplicate = isDuplicate;
	}

	/**
	 * Updates the target of the draft edge.
	 * @param to The new target, either a Point or a Node.
	 * @param isDuplicate Indicates if an edge like this one is already present in the FSA.
	 */
	updateTarget(to: Point | Node, isDuplicate: boolean): void {
		if (to instanceof Node) {
			this._to = to;
			this._pointingAtNode = true;
		} else {
			this._to = to;
			this._pointingAtNode = false;
		}
		this._isDuplicate = isDuplicate;
	}

	get isLoopback(): boolean {
		if (this._to instanceof Node) {
			return this.from.id === this._to.id;
		}
		return false;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		if (this._to instanceof Node) {
			return this._to.pos;
		}
		return this._to;
	}

	get pointingAtNode(): boolean {
		return this._pointingAtNode;
	}

	get isDuplicate(): boolean {
		return this._isDuplicate;
	}
}
