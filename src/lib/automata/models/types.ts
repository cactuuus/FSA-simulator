import type { Point } from '$lib/geometry';

/**
 * Basic interface for items in the FSA.
 */
export interface FSAItem {
	readonly id: string;
}

/**
 * Base interface for edges in the FSA. Defines common properties and methods for regular and draft
 * edges for convenience when drawing them.
 */
export interface BaseEdge {
	isLoopback(): boolean;
	get sourcePoint(): Point;
	get targetPoint(): Point;
	get curvature(): number;
}
