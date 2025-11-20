import { editor } from '$lib/stores/editor.svelte';
import { State, type EventContext } from '../types';

export class DrawEdgeState extends State {
	readonly name = 'draw-edge';
	#isDragging = false;

	onExit() {
		editor.clearDraftEdge();
	}

	handleMouseDown(ctx: EventContext): void {
		if (ctx.node) {
			editor.clearSelection();
			editor.setDraftEdge(ctx.node, ctx.node);
			this.#isDragging = true;
		}
	}

	handleMouseMove(ctx: EventContext): void {
		if (this.#isDragging) {
			if (ctx.node) {
				editor.updateDraftEdgeTarget(ctx.node);
			} else {
				editor.updateDraftEdgeTarget(ctx.mousePos);
			}
		}
	}

	handleMouseUp(ctx: EventContext): void {
		this.#isDragging = false;
		if (ctx.node && editor.draftEdge) {
			const newEdge = editor.commitDraftEdge(ctx.node);
			editor.selectItem(newEdge);
		}
		editor.clearDraftEdge();
	}
}
