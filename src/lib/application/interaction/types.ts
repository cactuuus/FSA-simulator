import type { Point } from '$lib/geometry';
import type { Edge, Node } from '$lib/automata/models';
import type { SelectionManager, DraftEdgeManager } from '$lib/application/managers';

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
 * Context for the editor, providing access to core components.
 */
export interface EditorContext {
	selectionManager: SelectionManager;
	draftEdgeManager: DraftEdgeManager;
}
