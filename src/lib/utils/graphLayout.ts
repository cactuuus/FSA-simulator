import { FSAGraph, Edge } from '$lib/automata-models';
import { vectorBetween, midPoint } from '$lib/utils/geometry';

const GRID_X_SPACING = 250;
const GRID_Y_SPACING = 200;
const GRID_OFFSET_X = 100;
const GRID_OFFSET_Y = 100;
const CURVATURE = 50;

/**
 * Arranges all nodes in the graph in a grid layout.
 * @param fsa The FSA graph to layout.
 */
export function layoutGrid(fsa: FSAGraph): void {
	const cols = Math.ceil(Math.sqrt(fsa.nodes.length));
	fsa.nodes.forEach((node, i) => {
		node.moveTo({
			x: (i % cols) * GRID_X_SPACING + GRID_OFFSET_X,
			y: Math.floor(i / cols) * GRID_Y_SPACING + GRID_OFFSET_Y
		});
	});
}

/**
 * Fixes bidirectional edges (A -> B and B -> A) by curving them in opposite directions.
 * @param fsa The FSA graph to fix.
 * @param bendAmount The amount to bend the edges, in pixels
 */
export function fixBidirectionalEdges(fsa: FSAGraph): void {
	const visited = new Set<string>();

	for (const edge of fsa.edges) {
		// reset the edge for consistency
		edge.resetControlPoint();

		if (edge.isLoopback) continue; // skip if loopback (they have no reverse)
		// skip if we already fixed this pair of if there is no reverse edge
		const reverseId = Edge.createId(edge.to.id, edge.from.id);
		if (visited.has(edge.id) || !fsa.edgesMap.has(reverseId)) continue;

		const reverse = fsa.edgesMap.get(reverseId)!;
		const middle = midPoint(edge.sourcePoint, edge.targetPoint);
		const edgeVector = vectorBetween(edge.sourcePoint, edge.targetPoint);
		// skip if the two nodes are in the same position
		// in the very unlikely case this was to happen, we would get a division by zero error when getting the perpendicular vector
		if (edgeVector.magnitude === 0) continue;

		const perpendicular = {
			x: -edgeVector.y / edgeVector.magnitude,
			y: edgeVector.x / edgeVector.magnitude
		};

		edge.updateControlPoint({
			x: middle.x + perpendicular.x * CURVATURE,
			y: middle.y + perpendicular.y * CURVATURE
		});

		reverse.updateControlPoint({
			x: middle.x - perpendicular.x * CURVATURE,
			y: middle.y - perpendicular.y * CURVATURE
		});

		visited.add(edge.id);
		visited.add(reverseId);
	}
}

/**
 * Applies the default layout to the given FSA graph, which consists of a grid layout and fixing bidirectional edges.
 * @param fsa The FSA graph to layout.
 */
export function toDefaultLayout(fsa: FSAGraph): void {
	layoutGrid(fsa);
	fixBidirectionalEdges(fsa);
}
