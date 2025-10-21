import type { Point } from '$lib/fsa';

export class Node {
	id: string;
	pos: Point;
	label: string;
	isStart: boolean;
	isAccepting: boolean;
	isSelected = false;

	constructor(
		pos: Point,
		label: string = '',
		isStart: boolean = false,
		isAccepting: boolean = false
	) {
		this.id = crypto.randomUUID();
		this.pos = pos;
		this.label = label;
		this.isStart = isStart;
		this.isAccepting = isAccepting;
	}

	contains(point: Point, radius: number = 30): boolean {
		const dx = this.pos.x - point.x;
		const dy = this.pos.y - point.y;
		return Math.sqrt(dx * dx + dy * dy) < radius;
	}

	moveTo(point: Point) {
		this.pos = point;
	}

	select() {
		this.isSelected = true;
	}

	unselect() {
		this.isSelected = false;
	}
}
