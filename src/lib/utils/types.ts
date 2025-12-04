import type { Edge, Node } from '$lib/fsa';

/**
 * Represents a point in 2D space with x and y coordinates.
 */
export interface Point {
	x: number;
	y: number;
}

/**
 * Normalised vector, representing only direction.
 * Note: this is simply an alias for Point, as they share the same structure. This was added simply
 * for semantic clarity during vector operations.
 */
export type UnitVector = Point;

/**
 * Vector with magnitude.
 */
export interface Vector extends UnitVector {
	magnitude: number;
}

/**
 * Context for mouse events, providing information about the event and its target.
 */
export interface EventContext {
	event: MouseEvent;
	node?: Node;
	edge?: Edge;
	isCanvas: boolean;
	mousePos: Point;
}
