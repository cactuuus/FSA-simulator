import type { Point, Vector } from '$lib/geometry';

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
 * Calculates the angle in radians from one point to another.
 * @param from The starting point.
 * @param to The ending point.
 * @returns The angle in radians from the starting point to the ending point.
 */
export function angleTo(from: Point, to: Point): number {
	return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Finds a point along a straight line defined by a starting point and a vector, at a specified distance.
 * @param from The starting point.
 * @param vector The direction vector.
 * @param distance The distance from the starting point.
 * @returns The point along the line at the specified distance.
 */
export function pointOnLine(from: Point, vector: Vector, distance: number): Point {
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
 * Calculate a point on a quadratic Bezier curve at parameter t.
 * More info here: https://mmrndev.medium.com/understanding-b%C3%A9zier-curves-f6eaa0fa6c7d
 *
 * @param t The parameter along the curve (0 <= t <= 1).
 * @param start The starting point of the curve.
 * @param control The control point of the curve.
 * @param end The ending point of the curve.
 * @returns The point on the Bezier curve at parameter t.
 */
export function pointOnBezierCurve(t: number, start: Point, control: Point, end: Point): Point {
	const t2 = t * t;
	const mt = 1 - t;
	const mt2 = mt * mt;
	return {
		x: mt2 * start.x + 2 * mt * t * control.x + t2 * end.x,
		y: mt2 * start.y + 2 * mt * t * control.y + t2 * end.y
	};
}
