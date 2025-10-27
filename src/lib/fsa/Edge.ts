import type { Point, Node, FSAItem } from '$lib/fsa';

export class Edge implements FSAItem {
	id: string;
	from: Node;
	to: Node;
	label: string;

	constructor(from: Node, to: Node, label: string = '') {
		this.from = from;
		this.to = to;
		this.id = `${from.id}-->${to.id}`;
		this.label = label;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		return this.to.pos;
	}

	isLoopback(): boolean {
		return this.from.id === this.to.id;
	}
}

export class DraftEdge {
	from: Node;
	to: Point;

	constructor(from: Node, to: Point) {
		this.from = from;
		this.to = to;
	}

	updateTarget(to: Point): void {
		this.to = to;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		return this.to;
	}
}
