import { State, type EventContext } from '$lib/application/interaction';
import { editor } from '$lib/stores/editor.svelte';

export class DrawEdgeState extends State {
	static readonly NAME = 'draw-edge';
	#isDragging = false;

	onExit() {
		editor.clearDraftEdge();
	}

	handleMouseDown(ctx: EventContext): void {
		if (ctx.node) {
			editor.selectionManager.clearSelection();
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
			editor.selectionManager.selectItem(newEdge);
		}
		editor.clearDraftEdge();
	}
}
