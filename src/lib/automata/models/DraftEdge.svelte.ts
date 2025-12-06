import type { Point } from '$lib/geometry';
import { type BaseEdge, Edge, Node } from '$lib/automata/models';

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

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		if (this._to instanceof Node) {
			return this._to.pos;
		}
		return this._to;
	}

	get loopbackAngle(): number {
		return Edge.LOOPBACK_DEFAULT_CURVATURE;
	}

	get pointingAtNode(): boolean {
		return this._pointingAtNode;
	}

	get isDuplicate(): boolean {
		return this._isDuplicate;
	}

	isLoopback(): boolean {
		if (this._to instanceof Node) {
			return this.from.id === this._to.id;
		}
		return false;
	}
}
