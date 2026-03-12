import {
	type Point,
	pointOnCircle,
	vectorBetween,
	pointOnLine,
	midPointOnBezier,
	angleTo,
	midPoint
} from '$lib/utils/geometry';
import { Edge, DraftEdge } from '$lib/automata-models';
import { GRAPH_GEOMETRY } from '$lib/utils/graphStyle';

// minimum distance of the control point from the center of the node
const loopbackDistance =
	GRAPH_GEOMETRY.nodeRadius + GRAPH_GEOMETRY.loopbackArcSize + GRAPH_GEOMETRY.loopbackLabelOffset;

/**
 * Generate SVG path for quadratic Bezier curve with node edge termination.
 * Handles both straight edges (when control point is at midpoint) and curved edges.
 * @param from The starting point of the edge.
 * @param to The ending point of the edge.
 * @param controlPoint The control point for the Bezier curve.
 * @param startOffset The offset to apply to the starting point.
 * @param endOffset The offset to apply to the ending point.
 * @returns The SVG path string representing the quadratic Bezier curve, from adjusted start to adjusted end.
 */
function getQuadraticBezierPath(
	from: Point,
	to: Point,
	controlPoint: Point,
	startOffset: number,
	endOffset: number
): string {
	const start = pointOnCircle(from, startOffset, angleTo(from, controlPoint));
	const end = pointOnCircle(to, endOffset, angleTo(to, controlPoint));
	return `M ${start.x} ${start.y} Q ${controlPoint.x} ${controlPoint.y} ${end.x} ${end.y}`;
}

/**
 * Calculate position for edge label.
 * @param edge The edge for which to calculate its label's position.
 * @returns The position of the edge label, centered vertically for multi-line labels.
 */
export function getEdgeLabelPosition(edge: Edge): Point {
	let position: Point;
	if (edge.isLoopback) {
		const angle = edge.hasDefaultControlPoint
			? GRAPH_GEOMETRY.loopbackDefaultAngle
			: angleTo(edge.sourcePoint, edge.controlPoint);
		position = pointOnCircle(edge.sourcePoint, loopbackDistance, angle);
	} else {
		const midpoint = midPointOnBezier(edge.sourcePoint, edge.controlPoint, edge.targetPoint);
		position = {
			x: midpoint.x + (edge.controlPoint.x - midpoint.x) * GRAPH_GEOMETRY.bezierLabelDistanceBias,
			y: midpoint.y + (edge.controlPoint.y - midpoint.y) * GRAPH_GEOMETRY.bezierLabelDistanceBias
		};
	}
	const verticalOffset = ((edge.transitions.length - 1) * GRAPH_GEOMETRY.labelLineHeight) / 2;
	return {
		x: position.x,
		y: position.y - verticalOffset
	};
}

export function getEdgeAnchor(edge: Edge): Point {
	if (edge.isLoopback) {
		const angle = edge.hasDefaultControlPoint
			? GRAPH_GEOMETRY.loopbackDefaultAngle
			: angleTo(edge.sourcePoint, edge.controlPoint);
		return pointOnCircle(edge.sourcePoint, loopbackDistance, angle);
	}
	if (edge.hasDefaultControlPoint) {
		// straight edge — just use the midpoint
		return midPoint(edge.sourcePoint, edge.targetPoint);
	}
	// curved edge — apex of the bezier
	return midPointOnBezier(edge.sourcePoint, edge.controlPoint, edge.targetPoint);
}

/**
 * Calculate the actual control point given the label position, effectively the inverse of
 * what getEdgeLabelPosition does.
 * This allows to use the label as a proxy for the control point, which is visually more intuitive than using an hidden, possibly distant (from the actual line) point.
 * For loopback edges, the control point is always at a fixed distance from the node center, so we can deduce it by calculating the angle between the node center and the label position.
 *
 * TLDR: Allows the user to drag the label to adjust the edge shape.
 *
 * @param edge The edge for which to calculate the control point.
 * @param labelPos The position of the label.
 * @return The calculated control point.
 */
export function getControlPointFromLabelPos(edge: Edge, labelPos: Point): Point {
	if (edge.isLoopback) {
		const angle = angleTo(edge.sourcePoint, labelPos);
		return pointOnCircle(edge.sourcePoint, loopbackDistance, angle);
	}
	const midWeight = (1 - GRAPH_GEOMETRY.bezierLabelDistanceBias) * 0.25;
	const controlWeight = 0.5 + 0.5 * GRAPH_GEOMETRY.bezierLabelDistanceBias;
	const midContribution = {
		x: midWeight * (edge.sourcePoint.x + edge.targetPoint.x),
		y: midWeight * (edge.sourcePoint.y + edge.targetPoint.y)
	};
	return {
		x: (labelPos.x - midContribution.x) / controlWeight,
		y: (labelPos.y - midContribution.y) / controlWeight
	};
}

/**
 * Calculates the SVG path for a loopback edge.
 * @param sourcePoint The center of the node from which the loopback edge originates.
 * @param startOffset The offset to apply to the starting point.
 * @param endOffset The offset to apply to the ending point.
 * @param angle The angle at which the loopback edge should be drawn, in radians.
 * @returns The SVG path string representing the loopback edge, from adjusted start to adjusted end.
 */
export function getLoopbackPath(
	sourcePoint: Point,
	startOffset: number,
	endOffset: number,
	angle: number
): string {
	const start = pointOnCircle(sourcePoint, startOffset, angle + Math.PI / 4);
	const end = pointOnCircle(sourcePoint, endOffset, angle - Math.PI / 4);
	return `M ${start.x} ${start.y}
			A ${GRAPH_GEOMETRY.loopbackArcSize} ${GRAPH_GEOMETRY.loopbackArcSize}, 0, 1, 0, ${end.x} ${end.y}`;
}

/**
 * Calculates the SVG path for a straight edge. Specifies whether there should be an offset at
 * the start and end points, to account for all types of straight edges (point-to-node,
 * node-to-node, and node-to-point).
 * @param from The starting point of the straight edge.
 * @param edge The straight edge.
 * @param startOffset The offset to apply to the starting point.
 * @param endOffset The offset to apply to the ending point.
 * @returns The SVG path string representing the straight edge, from adjusted start to adjusted end.
 */
export function getStraightPath(
	from: Point,
	to: Point,
	startOffset: number = 0,
	endOffset: number = 0
): string {
	const vector = vectorBetween(from, to);
	const start = startOffset !== 0 ? pointOnLine(from, vector, startOffset) : from;
	const end = endOffset !== 0 ? pointOnLine(from, vector, vector.magnitude - endOffset) : to;
	return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

/**
 * Generate SVG path for an edge.
 * @param edge The edge for which to calculate the SVG path.
 * @returns The SVG path string representing the edge.
 */
export function getRegularEdgePath(edge: Edge): string {
	if (edge.isLoopback) {
		const angle = edge.hasDefaultControlPoint
			? GRAPH_GEOMETRY.loopbackDefaultAngle
			: angleTo(edge.sourcePoint, edge.controlPoint);
		return getLoopbackPath(
			edge.sourcePoint,
			GRAPH_GEOMETRY.edgeStartOffset,
			GRAPH_GEOMETRY.edgeEndOffset,
			angle
		);
	} else if (edge.hasDefaultControlPoint) {
		return getStraightPath(
			edge.sourcePoint,
			edge.targetPoint,
			GRAPH_GEOMETRY.edgeStartOffset,
			GRAPH_GEOMETRY.edgeEndOffset
		);
	} else {
		return getQuadraticBezierPath(
			edge.sourcePoint,
			edge.targetPoint,
			edge.controlPoint,
			GRAPH_GEOMETRY.edgeStartOffset,
			GRAPH_GEOMETRY.edgeEndOffset
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
	const start: Point = { x: toPoint.x - GRAPH_GEOMETRY.startEdgeLength, y: toPoint.y };
	return getStraightPath(start, toPoint, 0, GRAPH_GEOMETRY.edgeEndOffset);
}

/**
 * Calculates the SVG path for a draft edge based on its type (loopback or straight).
 * This function is basically equivalent to getRegularEdgePath, it is only implemented to avoid
 * unnecessary complex conditionals.
 * @param draftEdge The draft edge for which to calculate the SVG path.
 * @returns The SVG path string representing the draft edge.
 */
export function getDraftEdgePath(draftEdge: DraftEdge): string {
	if (draftEdge.isLoopback) {
		return getLoopbackPath(
			draftEdge.sourcePoint,
			GRAPH_GEOMETRY.edgeStartOffset,
			GRAPH_GEOMETRY.edgeEndOffset,
			GRAPH_GEOMETRY.loopbackDefaultAngle
		);
	} else {
		return getStraightPath(
			draftEdge.sourcePoint,
			draftEdge.targetPoint,
			GRAPH_GEOMETRY.edgeStartOffset,
			draftEdge.pointingAtNode ? GRAPH_GEOMETRY.edgeEndOffset : 0
		);
	}
}
