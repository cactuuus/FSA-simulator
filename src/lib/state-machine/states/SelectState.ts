import { Node, Edge, type Point } from '$lib/fsa';
import { State, type EventContext } from '../types';
import { editor } from '$lib/stores/editor.svelte';

export class SelectState extends State {
	readonly name = 'select';
	#isDragging = false;

	handleMouseDown(ctx: EventContext): void {
		if (ctx.isCanvas) {
			editor.clearSelection();
		} else if (ctx.node) {
			editor.selectItem(ctx.node);
			this.#isDragging = true;
		} else if (ctx.edge) {
			editor.selectItem(ctx.edge);
			this.#isDragging = true;
		}
	}

	handleMouseMove(ctx: EventContext): void {
		if (!this.#isDragging) {
			return;
		}

		if (editor.selectedItem instanceof Node) {
			editor.fsaGraph.updateNodePosition(editor.selectedItem as Node, ctx.mousePos);
		} else if (editor.selectedItem instanceof Edge) {
			const edge = editor.selectedItem as Edge;
			const curvature = this.calculateCurvatureFromPoint(edge, ctx.mousePos);

			editor.fsaGraph.updateEdgeCurvature(edge, curvature);
		}
	}

	handleMouseUp(_ctx: EventContext): void {
		this.#isDragging = false;
	}

	private calculateCurvatureFromPoint(edge: Edge, mousePos: Point): number {
		const dx = edge.targetPoint.x - edge.sourcePoint.x;
		const dy = edge.targetPoint.y - edge.sourcePoint.y;
		const distance = Math.sqrt(dx ** 2 + dy ** 2);

		// midpoint of the straight line
		const midX = (edge.sourcePoint.x + edge.targetPoint.x) / 2;
		const midY = (edge.sourcePoint.y + edge.targetPoint.y) / 2;

		// vector from midpoint to mouse
		const toMouseX = mousePos.x - midX;
		const toMouseY = mousePos.y - midY;

		// perpendicular direction (normalized)
		const perpX = -dy / distance;
		const perpY = dx / distance;

		// project the mouse vector onto the perpendicular direction
		const curvature = toMouseX * perpX + toMouseY * perpY;

		return -curvature;
	}
}
