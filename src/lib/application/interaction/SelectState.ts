import { State, type EventContext } from '$lib/application/interaction';
import { Node, Edge } from '$lib/automata/models';
import { editor } from '$lib/stores/editor.svelte';
import { calculateCurvatureFromPoint } from '$lib/utils';

export class SelectState extends State {
	static readonly NAME = 'select';
	#isDragging = false;

	handleMouseDown(ctx: EventContext): void {
		if (ctx.isCanvas) {
			editor.selectionManager.clearSelection();
		} else if (ctx.node) {
			editor.selectionManager.selectItem(ctx.node);
			this.#isDragging = true;
		} else if (ctx.edge) {
			editor.selectionManager.selectItem(ctx.edge);
			this.#isDragging = true;
		}
	}

	handleMouseMove(ctx: EventContext): void {
		if (!this.#isDragging) {
			return;
		}
		if (editor.selectionManager.selectedItem instanceof Node) {
			editor.fsaGraph.updateNodePosition(
				editor.selectionManager.selectedItem as Node,
				ctx.mousePos
			);
		} else if (editor.selectionManager.selectedItem instanceof Edge) {
			const edge = editor.selectionManager.selectedItem as Edge;
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
