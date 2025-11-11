import { Node } from '$lib/fsa';
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
		}
	}

	handleMouseMove(ctx: EventContext): void {
		if (this.#isDragging && editor.selectedItem instanceof Node) {
			editor.fsaGraph.updateNodePosition(editor.selectedItem as Node, ctx.mousePos);
		}
	}

	handleMouseUp(_ctx: EventContext): void {
		this.#isDragging = false;
	}
}
