import type { Point, Node, Drawable } from '$lib/fsa';

export interface BaseEdge extends Drawable {
	sourcePoint: Point;
	targetPoint: Point;
}

export class Edge implements BaseEdge {
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

	draw(ctx: CanvasRenderingContext2D): void {
		// todo
	}
}

export class DraftEdge implements BaseEdge {
	from: Node;
	to: Point;

	constructor(from: Node, to: Point) {
		this.from = from;
		this.to = to;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		return this.to;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		// todo
	}
}
