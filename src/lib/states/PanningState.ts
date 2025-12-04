import type { Point } from '$lib/utils';
import { State } from '$lib/states';
import { editor } from '$lib/stores/editor.svelte';
import type { EventContext } from '$lib/utils';

/**
 * State for panning the canvas by dragging.
 * This state uses mouse position relative to the viewport to calculate panning deltas, instead of
 * using SVG coordinates produces gittering, as the latter produces gittering due to continuous
 * transformations between coordinate systems during panning.
 */
export class PanningState extends State {
	static readonly NAME = 'pan';
	#isDragging = false;
	#lastMousePos: Point | null = null;

	handleMouseDown(ctx: EventContext): void {
		this.#isDragging = true;
		this.#lastMousePos = { x: ctx.event.clientX, y: ctx.event.clientY };
	}

	handleMouseMove(ctx: EventContext): void {
		if (this.#isDragging) {
			const dx = ctx.event.clientX - (this.#lastMousePos?.x ?? 0);
			const dy = ctx.event.clientY - (this.#lastMousePos?.y ?? 0);
			editor.viewportManager.panCanvas({ x: dx, y: dy });
			this.#lastMousePos = { x: ctx.event.clientX, y: ctx.event.clientY };
		}
	}

	handleMouseUp(_ctx: EventContext): void {
		this.#isDragging = false;
		this.#lastMousePos = null;
	}
}
