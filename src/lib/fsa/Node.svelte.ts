import type { Point } from '$lib/utils';
import type { FSAItem } from '$lib/fsa';

/**
 * Represents a state in the finite state automaton (FSA). Each node has a position, label,
 * and acceptance status. Whether a node is starting or not is managed by the FSAGraph class.
 */
export class Node implements FSAItem {
	static readonly RADIUS = 30;

	readonly id: string;
	private _pos = $state<Point>({ x: 0, y: 0 });
	label = $state<string>('');
	isAccepting = $state<boolean>(false);

	constructor(pos: Point, label: string = '', isAccepting: boolean = false) {
		this.id = crypto.randomUUID();
		this._pos = pos;
		this.label = label;
		this.isAccepting = isAccepting;
	}

	get pos(): Point {
		return this._pos;
	}

	moveTo(newPos: Point): void {
		this._pos = newPos;
	}

	toggleAccepting(): void {
		this.isAccepting = !this.isAccepting;
	}
}
