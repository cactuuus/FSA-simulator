import { canvasTheme as ct } from '$lib/canvas';
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
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = ct.styles.edgeStroke.value;
		ctx.lineWidth = 2;
		ctx.moveTo(this.sourcePoint.x, this.sourcePoint.y);
		ctx.lineTo(this.targetPoint.x, this.targetPoint.y);
		ctx.stroke();
		ctx.restore();
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
		ctx.save();
		ctx.strokeStyle = ct.styles.draftStroke.value;
		ctx.lineWidth = 2;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.moveTo(this.sourcePoint.x, this.sourcePoint.y);
		ctx.lineTo(this.targetPoint.x, this.targetPoint.y);
		ctx.stroke();
		ctx.restore();
	}
}
