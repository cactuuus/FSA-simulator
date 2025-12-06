import type { Point } from '$lib/geometry';
import type { Edge, Node } from '$lib/automata/models';

/**
 * Context for mouse events, providing information about the event and its target.
 */
export interface EventContext {
	event: PointerEvent | MouseEvent;
	node?: Node;
	edge?: Edge;
	isCanvas: boolean;
	pointerPos: Point;
}
