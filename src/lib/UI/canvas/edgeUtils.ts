import {
	type BaseEdge,
	type Point,
	type Vector,
	type UnitVector,
	Node,
	Edge,
	DraftEdge
} from '$lib/fsa';

// vector helpers //

/**
 * Calculates the vector from one point to another.
 * @param from The starting point.
 * @param to The ending point.
 * @returns The vector from the starting point to the ending point.
 */
function vectorBetween(from: Point, to: Point): Vector {
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
function perpendicular(vector: Vector): UnitVector {
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
function dotProduct(v1: UnitVector, v2: UnitVector): number {
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
function pointAlongLine(from: Point, vector: Vector, distance: number): Point {
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
function pointOnCircle(center: Point, radius: number, angle: number): Point {
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
function angleTo(from: Point, to: Point): number {
	return Math.atan2(to.y - from.y, to.x - from.x);
}

// curvature calculations //

/**
 * Helper interface representing the geometry of an arc.
 */
interface ArcGeometry {
	center: Point;
	radius: number;
	sweepFlag: 0 | 1;
}

/**
 * Calculates the geometry of an arc for a given edge and vector.
 * @param edge The edge for which to calculate the arc geometry.
 * @param vector The vector representing the direction and magnitude between the edge's source and
 *  target points.
 * @returns The geometry of the arc including its center, radius, and sweep flag.
 */
function calculateArcGeometry(edge: BaseEdge, vector: Vector): ArcGeometry {
	const h = Math.abs(edge.curvature);
	const maxCurvature = vector.magnitude / 2;
	const clampedH = Math.min(h, maxCurvature);

	const radius = (vector.magnitude ** 2 / 4 + clampedH ** 2) / (2 * clampedH);

	const mid = midPoint(edge.sourcePoint, edge.targetPoint);
	const perp = perpendicular(vector);
	// clamp to avoid NaN from sqrt of negative number, due to floating point errors
	const centerOffset = Math.sqrt(Math.max(0, radius ** 2 - (vector.magnitude / 2) ** 2));
	const centerDirection = edge.curvature > 0 ? 1 : -1;

	const center: Point = {
		x: mid.x + perp.x * centerOffset * centerDirection,
		y: mid.y + perp.y * centerOffset * centerDirection
	};

	const sweepFlag: 0 | 1 = edge.curvature > 0 ? 1 : 0;

	return { center, radius, sweepFlag };
}

/**
 * Calculates the curvature for an edge based on a given mouse position.
 * @param edge The edge for which to calculate the curvature.
 * @param mousePos The position of the mouse (in SVG coordinates).
 * @returns The calculated curvature.
 */
export function calculateCurvatureFromPoint(edge: BaseEdge, mousePos: Point): number {
	if (edge.isLoopback()) {
		const angle = angleTo(edge.sourcePoint, mousePos);
		return angle;
	}

	const vector = vectorBetween(edge.sourcePoint, edge.targetPoint);
	const mid = midPoint(edge.sourcePoint, edge.targetPoint);

	// vector from midpoint to mouse
	const toMouse = vectorBetween(mid, mousePos);

	// perpendicular direction (normalized)
	const perp = perpendicular(vector);
	const curvature = dotProduct(toMouse, perp);

	return -curvature;
}

// SVG path calculations //

/**
 * Calculates the SVG path for a loopback edge.
 * @param edge The loopback edge.
 * @returns The SVG path string representing the loopback edge.
 */
export function getLoopbackPath(edge: BaseEdge): string {
	const offset = 40; // fixed offset for loopback size
	const start = pointOnCircle(edge.sourcePoint, Node.RADIUS, edge.curvature + Math.PI / 4);
	const end = pointOnCircle(edge.sourcePoint, Node.RADIUS, edge.curvature - Math.PI / 4);

	return `M ${start.x} ${start.y} A ${offset} ${offset}, 0, 1, 0, ${end.x} ${end.y}`;
}

/**
 * Calculates the SVG path for a straight edge. Specifies whether there should be an offset at
 * the start and end points, to account for all types of straight edges (point-to-node,
 * node-to-node, and node-to-point).
 * @param from The starting point of the straight edge.
 * @param edge The straight edge.
 * @param startOffset Whether to apply an offset at the start point.
 * @param endOffset Whether to apply an offset at the end point.
 * @returns The SVG path string representing the straight edge.
 */
export function getStraightPath(
	from: Point,
	to: Point,
	startOffset: boolean = true,
	endOffset: boolean = true
): string {
	const vector = vectorBetween(from, to);

	const start = startOffset ? pointAlongLine(from, vector, Node.RADIUS) : from;
	const end = endOffset ? pointAlongLine(from, vector, vector.magnitude - Node.RADIUS) : to;
	return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

/**
 * Calculates the SVG path for a curved edge.
 * @param edge The curved edge.
 * @returns The SVG path string representing the curved edge.
 */
export function getCurvedPath(edge: BaseEdge): string {
	const vector = vectorBetween(edge.sourcePoint, edge.targetPoint);
	const { center, radius, sweepFlag } = calculateArcGeometry(edge, vector);

	// calculate new start/end points offset by node radius
	const angleToSource = angleTo(center, edge.sourcePoint);
	const angleToTarget = angleTo(center, edge.targetPoint);

	// shorten by node radius on both ends
	const angleToRemove = Node.RADIUS / radius;
	let newSourceAngle, newTargetAngle;
	if (edge.curvature > 0) {
		newSourceAngle = angleToSource + angleToRemove;
		newTargetAngle = angleToTarget - angleToRemove;
	} else {
		newSourceAngle = angleToSource - angleToRemove;
		newTargetAngle = angleToTarget + angleToRemove;
	}

	const start = pointOnCircle(center, radius, newSourceAngle);
	const end = pointOnCircle(center, radius, newTargetAngle);

	return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweepFlag} ${end.x} ${end.y}`;
}

/**
 * Calculates the SVG path for an edge based on its type (loopback, straight, or curved).
 * @param edge The edge for which to calculate the SVG path.
 * @returns The SVG path string representing the edge.
 */
export function getRegularEdgePath(edge: Edge): string {
	if (edge.isLoopback()) {
		return getLoopbackPath(edge);
	} else if (edge.curvature === 0) {
		return getStraightPath(edge.sourcePoint, edge.targetPoint);
	} else {
		return getCurvedPath(edge);
	}
}

/**
 * Calculates the SVG path for a draft edge based on its type (loopback or straight).
 * This function is basically equivalent to getRegularEdgePath, it is only implemented to avoid
 * unnecessary complex conditionals.
 * @param draftEdge The draft edge for which to calculate the SVG path.
 * @returns The SVG path string representing the draft edge.
 */
export function getDraftEdgePath(draftEdge: DraftEdge): string {
	if (draftEdge.isLoopback()) {
		return getLoopbackPath(draftEdge);
	} else {
		return getStraightPath(
			draftEdge.sourcePoint,
			draftEdge.targetPoint,
			true,
			draftEdge.pointingAtNode
		);
	}
}

/**
 * Calculates the SVG path for a start edge pointing to a given point (the center of the starting
 * node).
 * @param toPoint The center of the starting node.
 * @returns The SVG path string representing the start edge.
 */
export function getStartEdgePath(toPoint: Point): string {
	const length = 100;
	const start: Point = { x: toPoint.x - length, y: toPoint.y };
	return getStraightPath(start, toPoint, false, true);
}
