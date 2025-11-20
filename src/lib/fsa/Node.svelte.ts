import type { Point, FSAItem } from '$lib/fsa';

export class Node implements FSAItem {
	static readonly RADIUS = 30;

	id: string;
	pos: Point;
	label: string;
	isAccepting: boolean;

	constructor(pos: Point, label: string = '', isAccepting: boolean = false) {
		this.id = crypto.randomUUID();
		this.pos = $state(pos);
		this.label = $state(label);
		this.isAccepting = $state(isAccepting);
	}

	moveTo(point: Point) {
		this.pos = point;
	}
}
