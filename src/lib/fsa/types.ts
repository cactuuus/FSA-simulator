export interface Point {
	x: number;
	y: number;
}

export interface FSAItem {
	id: string;
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
