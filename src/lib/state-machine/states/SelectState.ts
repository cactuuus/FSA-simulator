import { Node, Edge } from '$lib/fsa';
import { State, type EventContext } from '$lib/state-machine';
import { editor } from '$lib/stores/editor.svelte';
import { calculateCurvatureFromPoint } from '$lib/utils';

export class SelectState extends State {
	static readonly NAME = 'select';
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
			const curvature = calculateCurvatureFromPoint(edge, ctx.mousePos);
			editor.fsaGraph.updateEdgeCurvature(edge, curvature);
		}
	}

	handleMouseUp(_ctx: EventContext): void {
		this.#isDragging = false;
	}

	handleDoubleClick(_ctx: EventContext): void {
		if (_ctx.node) {
			_ctx.node.toggleAccepting();
		}
	}
}
