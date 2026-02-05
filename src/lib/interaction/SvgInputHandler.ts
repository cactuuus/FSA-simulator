import { Node, Edge, type FSAGraph } from '$lib/automata/models';
import type { Point } from '$lib/utils/geometry';
import type { State } from '$lib/interaction/State';

/**
 * Context for pointer events, providing information about the event and its target.
 */
export interface EventContext {
	event: PointerEvent | MouseEvent;
	node?: Node;
	edge?: Edge;
	isCanvas: boolean;
	pointerPos: Point;
}

/**
 * Handler for SVG input events.
 * It translates raw pointer events from the SVG element into higher-level events. It also manages drag detection.
 */
export class SvgInputHandler {
	private _svgElement: SVGSVGElement;
	private _fsaGraph: FSAGraph;
	private _getCurrentState: () => State | null;

	private _pointerDownPos: Point | null = null;
	private _pointerDownCtx: EventContext | null = null;
	private _lastProcessedPos: Point | null = null;
	private _isDragging = false;

	private static readonly DRAG_DISTANCE_THRESHOLD = 5; // pixels

	constructor(svgElement: SVGSVGElement, fsaGraph: FSAGraph, getCurrentState: () => State | null) {
		this._svgElement = svgElement;
		this._fsaGraph = fsaGraph;
		this._getCurrentState = getCurrentState;
	}

	handlePointerDown(e: PointerEvent): void {
		// safety checks
		if (e.button !== 0 || !e.isPrimary) return;

		this._svgElement.setPointerCapture(e.pointerId);
		const ctx = this.createEventContext(e);
		this._pointerDownPos = ctx.pointerPos;
		this._pointerDownCtx = ctx;
		this._isDragging = false;
	}

	handlePointerMove(e: PointerEvent): void {
		// safety checks
		const currentState = this._getCurrentState();
		if (!currentState || !this._pointerDownPos || !this._pointerDownCtx) return;

		const ctx = this.createEventContext(e);
		// Stop processing event if the pointer hasn't moved since the last processed event.
		if (
			this._lastProcessedPos &&
			ctx.pointerPos.x === this._lastProcessedPos.x &&
			ctx.pointerPos.y === this._lastProcessedPos.y
		) {
			return;
		}
		this._lastProcessedPos = ctx.pointerPos;

		const distance = Math.hypot(
			ctx.pointerPos.x - this._pointerDownPos.x,
			ctx.pointerPos.y - this._pointerDownPos.y
		);

		// Determine if we should continue or start dragging
		if (this._isDragging) {
			currentState.handleDragMove?.(ctx);
		} else if (distance > SvgInputHandler.DRAG_DISTANCE_THRESHOLD) {
			this._isDragging = true;
			currentState.handleDragStart?.(this._pointerDownCtx);
		}
	}

	handlePointerUp(e: PointerEvent): void {
		// safety checks
		const currentState = this._getCurrentState();
		if (e.button !== 0 || !e.isPrimary || !this._pointerDownCtx || !currentState) return;

		const ctx = this.createEventContext(e);
		if (this._isDragging) {
			currentState.handleDragEnd?.(ctx);
		} else {
			currentState.handleClick?.(this._pointerDownCtx);
		}

		this._svgElement.releasePointerCapture(e.pointerId);
		this._pointerDownPos = null;
		this._pointerDownCtx = null;
		this._lastProcessedPos = null;
		this._isDragging = false;
	}

	handleDoubleClick(e: MouseEvent): void {
		const currentState = this._getCurrentState();
		if (!currentState) return;

		const ctx = this.createEventContext(e);
		currentState.handleDoubleClick?.(ctx);
	}

	/**
	 * Gets the pointer position relative to the SVG element.
	 * It returns the coordinates in SVG space, rounded to the nearest integer (this doesn't seem to cause any issues and makes the coordinates easier to work with).
	 */
	getPointerPosFromEvent(e: MouseEvent | PointerEvent): Point {
		const pivot = this._svgElement.createSVGPoint();
		pivot.x = e.clientX;
		pivot.y = e.clientY;
		const transformed = pivot.matrixTransform(this._svgElement.getScreenCTM()?.inverse());
		return {
			x: Math.round(transformed.x),
			y: Math.round(transformed.y)
		};
	}

	/**
	 * Get the context of a mouse event, including which FSA item (if any) was targeted.
	 * The mouse position (mousePos) is given in SVG coordinates. The actual mouse position
	 * (relative to the viewport) can be accessed via the event object ({ e.clientX, e.clientY }).
	 */
	private createEventContext(e: PointerEvent | MouseEvent): EventContext {
		const element = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-fsa-item]');
		const elementId = element?.getAttribute('data-id') ?? null;
		const fsaItem = elementId ? this._fsaGraph.getItemFromId(elementId) : null;

		return {
			event: e,
			node: fsaItem instanceof Node ? fsaItem : undefined,
			edge: fsaItem instanceof Edge ? fsaItem : undefined,
			isCanvas: fsaItem === null,
			pointerPos: this.getPointerPosFromEvent(e)
		};
	}
}
