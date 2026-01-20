import {
	type Point,
	pointOnCircle,
	vectorBetween,
	pointOnLine,
	pointOnBezierCurve,
	angleTo
} from '$lib/geometry';
import { Edge, Node, DraftEdge, type BaseEdge } from '$lib/automata/models';

export const LABEL_DISTANCE_BIAS = 0.5; // distance bias placing label between bezier midpoint and control point
export const LOOPBACK_SIZE = 40; // fixed offset for loopback size
export const LABEL_OFFSET = 40; // distance of the label from the arrow
export const LINE_HEIGHT = 20; // height of each line in the label
export const START_OFFSET = 3; // offset for node distance calculations, to avoid overlapping with node borders
export const END_OFFSET = 5; // offset for node distance calculations, to avoid overlapping with node borders

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

	if (edge.isLoopback()) {
		const offset = LOOPBACK_SIZE + LABEL_OFFSET + Node.RADIUS + START_OFFSET;
		position = pointOnCircle(edge.sourcePoint, offset, edge.loopbackAngle);
	} else {
		const curveMidpoint = pointOnBezierCurve(
			0.5,
			edge.sourcePoint,
			edge.controlPoint,
			edge.targetPoint
		);
		position = {
			x: curveMidpoint.x + (edge.controlPoint.x - curveMidpoint.x) * LABEL_DISTANCE_BIAS,
			y: curveMidpoint.y + (edge.controlPoint.y - curveMidpoint.y) * LABEL_DISTANCE_BIAS
		};
	}

	const verticalOffset = ((edge.label.length - 1) * LINE_HEIGHT) / 2;
	return {
		x: position.x,
		y: position.y - verticalOffset
	};
}

/**
 * Calculate the actual control point given the label position, effectively the inverse of
 * what getEdgeLabelPosition does.
 * This allows to use the label as a proxy for the control point, which is visually more intuitive
 * than using an hidden, possibly distant (from the actual line) point.
 *
 * TLDR: Allows the user to drag the label to adjust the Bezier curve.
 *
 * @param edge The edge for which to calculate the control point.
 * @return The calculated control point.
 */
export function getControlPointFromLabelPos(edge: Edge, labelPos: Point): Point {
	const midWeight = (1 - LABEL_DISTANCE_BIAS) * 0.25;
	const controlWeight = 0.5 + 0.5 * LABEL_DISTANCE_BIAS;
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
 * @param edge The loopback edge.
 * @param startOffset The offset to apply to the starting point.
 * @param endOffset The offset to apply to the ending point.
 * @returns The SVG path string representing the loopback edge, from adjusted start to adjusted end.
 */
export function getLoopbackPath(edge: BaseEdge, startOffset: number, endOffset: number): string {
	const start = pointOnCircle(edge.sourcePoint, startOffset, edge.loopbackAngle + Math.PI / 4);
	const end = pointOnCircle(edge.sourcePoint, endOffset, edge.loopbackAngle - Math.PI / 4);
	return `M ${start.x} ${start.y}
			A ${LOOPBACK_SIZE} ${LOOPBACK_SIZE}, 0, 1, 0, ${end.x} ${end.y}`;
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
	const adjustedStartOffset = Node.RADIUS + START_OFFSET;
	const adjustedEndOffset = Node.RADIUS + END_OFFSET;
	if (edge.isLoopback()) {
		return getLoopbackPath(edge, adjustedStartOffset, adjustedEndOffset);
	} else if (edge.isStraight()) {
		return getStraightPath(
			edge.sourcePoint,
			edge.targetPoint,
			adjustedStartOffset,
			adjustedEndOffset
		);
	} else {
		return getQuadraticBezierPath(
			edge.sourcePoint,
			edge.targetPoint,
			edge.controlPoint,
			adjustedStartOffset,
			adjustedEndOffset
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
	return getStraightPath(start, toPoint, 0, Node.RADIUS + END_OFFSET);
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
		return getLoopbackPath(draftEdge, Node.RADIUS + START_OFFSET, Node.RADIUS + END_OFFSET);
	} else {
		return getStraightPath(
			draftEdge.sourcePoint,
			draftEdge.targetPoint,
			Node.RADIUS + START_OFFSET,
			draftEdge.pointingAtNode ? Node.RADIUS + END_OFFSET : 0
		);
	}
}
