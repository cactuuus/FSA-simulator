/**
 * Represents a point in 2D space with x and y coordinates.
 */
export interface Point {
	x: number;
	y: number;
}

/**
 * Basic interface for items in the FSA.
 */
export interface FSAItem {
	readonly id: string;
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
