import { canvasStyle } from '$lib';
import type { Drawable, Point } from '$lib/fsa';

export class Node implements Drawable {
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

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		ctx.strokeStyle = canvasStyle.nodeStroke;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, 30, 0, Math.PI * 2);
		ctx.stroke();

		ctx.fillStyle = canvasStyle.nodeText;
		ctx.font = '16px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.label, this.pos.x, this.pos.y);

		if (this.isSelected) {
			ctx.strokeStyle = canvasStyle.selectedStroke;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, 28, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.restore();
	}
}
