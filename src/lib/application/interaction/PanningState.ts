import type { Point } from '$lib/geometry';
import { State, type EventContext } from '$lib/application/interaction';

/**
 * State for panning the canvas by dragging.
 * This state uses mouse position relative to the viewport to calculate panning deltas, instead of
 * using SVG coordinates produces gittering, as the latter produces gittering due to continuous
 * transformations between coordinate systems during panning.
 */
export class PanningState extends State {
	static readonly NAME = 'pan';
	#isDragging = false;
	#lastPointerPos: Point | null = null;

	handlePointerDown(ctx: EventContext): void {
		this.#isDragging = true;
		this.#lastPointerPos = { x: ctx.event.clientX, y: ctx.event.clientY };
	}

	handlePointerMove(ctx: EventContext): void {
		if (this.#isDragging) {
			const dx = ctx.event.clientX - (this.#lastPointerPos?.x ?? 0);
			const dy = ctx.event.clientY - (this.#lastPointerPos?.y ?? 0);
			this.editorCtx.viewportManager.panCanvas({ x: dx, y: dy });
			this.#lastPointerPos = { x: ctx.event.clientX, y: ctx.event.clientY };
		}
	}

	handlePointerUp(_ctx: EventContext): void {
		this.#isDragging = false;
		this.#lastPointerPos = null;
	}
}
