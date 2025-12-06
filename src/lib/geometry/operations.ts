import type { Point, Vector, UnitVector } from '$lib/geometry';

/**
 * Calculates the vector from one point to another.
 * @param from The starting point.
 * @param to The ending point.
 * @returns The vector from the starting point to the ending point.
 */
export function vectorBetween(from: Point, to: Point): Vector {
	const x = to.x - from.x;
	const y = to.y - from.y;
	const magnitude = Math.sqrt(x ** 2 + y ** 2);
	return { x, y, magnitude };
}

/**
 * Calculates the perpendicular, normalised vector of a given vector, rotated 90 degrees clockwise.
 * @param vector The input vector.
 * @return The perpendicular, normalised vector.
 */
export function perpendicular(vector: Vector): UnitVector {
	return {
		x: -vector.y / vector.magnitude,
		y: vector.x / vector.magnitude
	};
}

/**
 * Calculates the dot product of two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The dot product of the two vectors.
 */
export function dotProduct(v1: UnitVector, v2: UnitVector): number {
	return v1.x * v2.x + v1.y * v2.y;
}

// point helpers //

/**
 * Finds the midpoint between two points.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The midpoint between the two points.
 */
export function midPoint(p1: Point, p2: Point): Point {
	return {
		x: (p1.x + p2.x) / 2,
		y: (p1.y + p2.y) / 2
	};
}

/**
 * Finds a point along a line defined by a starting point and a vector, at a specified distance.
 * @param from The starting point.
 * @param vector The direction vector.
 * @param distance The distance from the starting point.
 * @returns The point along the line at the specified distance.
 */
export function pointAlongLine(from: Point, vector: Vector, distance: number): Point {
	const ratio = distance / vector.magnitude;
	return {
		x: from.x + vector.x * ratio,
		y: from.y + vector.y * ratio
	};
}

/**
 * Calculates a point on the circumference of a circle given its center, radius, and angle.
 * @param center The center point of the circle.
 * @param radius The radius of the circle.
 * @param angle The angle in radians.
 * @returns The point on the circumference of the circle.
 */
export function pointOnCircle(center: Point, radius: number, angle: number): Point {
	return {
		x: center.x + radius * Math.cos(angle),
		y: center.y + radius * Math.sin(angle)
	};
}

/**
 * Calculates the angle in radians from one point to another.
 * @param from The starting point.
 * @param to The ending point.
 * @returns The angle in radians from the starting point to the ending point.
 */
export function angleTo(from: Point, to: Point): number {
	return Math.atan2(to.y - from.y, to.x - from.x);
}
