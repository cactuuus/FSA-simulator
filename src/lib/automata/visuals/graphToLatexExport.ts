import { type Point, angleTo } from '$lib/utils/geometry';
import { type FSAGraph, Transition, type Edge, Node } from '$lib/automata/models';
import { GRAPH_GEOMETRY } from './graphConfig';

const SCALE = 50; // scale factor to convert from SVG (pixels) to TikZ (cm)
const TIKZ_PACKAGES = `% Required packages:
% \\usepackage{tikz}
% \\usepackage{amsmath}
% \\usetikzlibrary{automata, positioning, arrows.meta, bending}`;

/**
 * Convert SVG (pixel) coordinates to TikZ (cm) coordinates.
 * Note: SVG y-axis points down, while TikZ y-axis points up, hence we negate it in the conversion.
 * @param p The point in SVG coordinates.
 * @returns The point converted to TikZ coordinates.
 */
function toTikz(p: Point): Point {
	return {
		x: Math.round((p.x / SCALE) * 100) / 100,
		y: Math.round((-p.y / SCALE) * 100) / 100
	};
}

/**
 * Convert radians (used by SVG) to degrees (used by TikZ), rounding to the nearest integer.
 * @param radians The angle in radians.
 * @returns The angle converted to degrees.
 */
function toDegrees(radians: number): number {
	return Math.round((radians * 180) / Math.PI);
}

/**
 * Sanitizes a node label for use as a TikZ node name, getting rid of special characters.
 * @param label The original node label.
 * @returns A sanitized string compatible with TikZ.
 */
function cleanNodeLabel(label: string): string {
	return label.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Generates a TikZ label string for a transition, handling epsilon and PDA stack ops.
 * @param t The transition object.
 * @returns A TikZ label string.
 */
function transitionLabel(t: Transition): string {
	const escape = (s: string) =>
		s
			.replace(/\\/g, '\\textbackslash{}')
			.replace(/[&%$#_{}~^]/g, (c) => `\\${c}`)
			.replace(Transition.EPSILON, '\\varepsilon{}');

	if (t.hasStackOps()) {
		return `$${escape(t.consume)}, ${escape(t.pop!)} \\to ${escape(t.push!)}$`;
	}
	return `$${escape(t.consume)}$`;
}

/**
 * Converts a list of transitions into a TikZ label string. If there's more than one transition, they are stacked vertically using an array.
 * @param transitions The list of transitions to be turned into a label
 * @returns A TikZ label string.
 */
function edgeLabel(transitions: Transition[]): string {
	if (transitions.length === 1) return transitionLabel(transitions[0]);
	const rows = transitions.map(transitionLabel).join(' \\\\ ');
	return `$\\begin{array}{c} ${rows} \\end{array}$`;
}

/**
 * Gets the appropriate TikZ label anchor for a loopback edge based on its angle.
 * @param tikzAngleDeg The angle of the loop in degrees (0 = right, 90 = up).
 * @returns The TikZ anchor position for the label (e.g. 'above', 'below', 'left', 'right').
 */
function loopLabelAnchor(tikzAngleDeg: number): string {
	const a = ((tikzAngleDeg % 360) + 360) % 360; // normalize to [0, 360)
	if (a >= 315 || a < 45) return 'right';
	if (a >= 45 && a < 135) return 'above';
	if (a >= 135 && a < 225) return 'left';
	return 'below';
}

/**
 * Generates the TikZ \node command for a state.
 * @param node The node to convert.
 * @param isStart Whether the node is the start state.
 * @returns A TikZ \node command string.
 */
function nodeToTikz(node: Node, isStart: boolean): string {
	const { x, y } = toTikz(node.pos);
	const label = cleanNodeLabel(node.label);

	const styles: string[] = ['state'];
	if (isStart) styles.push('initial');
	if (node.isAccepting) styles.push('accepting');
	return `  \\node[${styles.join(', ')}] (${label}) at (${x}, ${y}) {$${node.label}$};`;
}

/**
 * Generates the TikZ cubic bezier control points from a quadratic bezier (https://stackoverflow.com/a/3162732).
 * @param p0 The start point of the curve.
 * @param p1 The control point of the quadratic curve.
 * @param p2 The end point of the curve.
 * @returns An object containing the two control points for the cubic bezier, converted to TikZ coordinates.
 */
function quadraticToCubic(p0: Point, p1: Point, p2: Point): { cp1: Point; cp2: Point } {
	const cp1Raw = {
		x: p0.x + (2 / 3) * (p1.x - p0.x),
		y: p0.y + (2 / 3) * (p1.y - p0.y)
	};
	const cp2Raw = {
		x: p2.x + (2 / 3) * (p1.x - p2.x),
		y: p2.y + (2 / 3) * (p1.y - p2.y)
	};
	return { cp1: toTikz(cp1Raw), cp2: toTikz(cp2Raw) };
}

/**
 * Generates the TikZ \draw command for a regular edge (non-loopback).
 * @param edge The edge to convert.
 * @returns A TikZ \draw command string.
 */
function edgeToTikz(edge: Edge): string {
	const fromLabel = cleanNodeLabel(edge.from.label);
	const toLabel = cleanNodeLabel(edge.to.label);
	const label = edgeLabel(edge.transitions);

	// straight edge
	if (edge.hasDefaultControlPoint) {
		return `  \\draw[->] (${fromLabel}) edge node[auto] {${label}} (${toLabel});`;
	}
	// curved edge
	const { cp1, cp2 } = quadraticToCubic(edge.sourcePoint, edge.controlPoint, edge.targetPoint);
	return `  \\draw[->] (${fromLabel}) .. controls (${cp1.x}, ${cp1.y}) and (${cp2.x}, ${cp2.y}) .. node[auto] {${label}} (${toLabel});`;
}

/**
 * Generates the TikZ \draw command for a loopback edge.
 * @param edge The loopback edge to convert.
 * @returns A TikZ \draw command string for the loopback edge.
 */
function loopbackEdgeToTikz(edge: Edge): string {
	const nodeLabel = cleanNodeLabel(edge.from.label);
	const label = edgeLabel(edge.transitions);

	const angleRad = edge.hasDefaultControlPoint
		? GRAPH_GEOMETRY.loopbackDefaultAngle
		: angleTo(edge.sourcePoint, edge.controlPoint);
	// angle is adjusted to match TikZ's coordinate system
	const tikzAngleDeg = toDegrees(-angleRad);

	const inAngle = tikzAngleDeg + 45;
	const outAngle = tikzAngleDeg - 45;
	const anchor = loopLabelAnchor(tikzAngleDeg);

	return `  \\draw[->] (${nodeLabel}) edge[loop, out=${outAngle}, in=${inAngle}, looseness=6] node[${anchor}] {${label}} (${nodeLabel});`;
}

/**
 * Exports an FSAGraph to a TikZ string, ready to paste into a LaTeX document.
 * Note: TickZ already handles drawing the starting arrow for initial states, so here it is skipped.
 * @param fsa The FSA graph to export.
 * @returns A TikZ code, in string format, representing the graph.
 */
export function graphToTikz(fsa: FSAGraph): string {
	const lines: string[] = [];

	lines.push(TIKZ_PACKAGES);
	lines.push('');
	lines.push('\\begin{tikzpicture}[');
	lines.push('  > = {Stealth[bend]},');
	lines.push('  shorten > = 2pt,');
	lines.push('  shorten < = 2pt,');
	lines.push('  auto,');
	lines.push('  node distance = 2cm,');
	lines.push('  semithick');
	lines.push(']');
	lines.push('');
	lines.push('  % States');

	// nodes
	for (const node of fsa.nodes) {
		lines.push(nodeToTikz(node, fsa.startNode?.id === node.id));
	}

	lines.push('');
	lines.push('  % Transitions');

	// edges
	for (const edge of fsa.edges) {
		if (edge.isLoopback) {
			lines.push(loopbackEdgeToTikz(edge));
		} else {
			lines.push(edgeToTikz(edge));
		}
	}

	lines.push('');
	lines.push('\\end{tikzpicture}');
	return lines.join('\n');
}
