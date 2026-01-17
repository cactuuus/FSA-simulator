import { EditorState } from './EditorState';
import type { EventContext } from '$lib/interaction/SvgInputHandler';
import type { Point } from '$lib/geometry';

/**
 * State for panning the canvas by dragging.
 * This state uses mouse position relative to the viewport to calculate panning deltas, instead of
 * using SVG coordinates produces gittering, as the latter produces gittering due to continuous
 * transformations between coordinate systems during panning.
 *
 * - Dragging (anywhere): pans the viewport according to pointer movement.
 */
export class PanningState extends EditorState {
	static readonly NAME = 'pan';
	private _lastPointerPos: Point | null = null;

	handleDragStart(ctx: EventContext): void {
		this._lastPointerPos = { x: ctx.event.clientX, y: ctx.event.clientY };
	}

	handleDragMove(ctx: EventContext): void {
		const dx = ctx.event.clientX - (this._lastPointerPos?.x ?? 0);
		const dy = ctx.event.clientY - (this._lastPointerPos?.y ?? 0);
		this.editorCtx.viewport.panCanvas({ x: dx, y: dy });
		this._lastPointerPos = { x: ctx.event.clientX, y: ctx.event.clientY };
	}

	handleDragEnd(_ctx: EventContext): void {
		this._lastPointerPos = null;
	}
}
