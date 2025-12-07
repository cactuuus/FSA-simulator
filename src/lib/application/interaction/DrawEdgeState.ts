import { State, type EventContext } from '$lib/application/interaction';

export class DrawEdgeState extends State {
	static readonly NAME = 'draw-edge';
	#isDragging = false;

	onExit() {
		this.editorCtx.draftEdgeManager.clearDraftEdge();
	}

	handlePointerDown(ctx: EventContext): void {
		if (ctx.node) {
			this.editorCtx.selectionManager.clearSelection();
			this.editorCtx.draftEdgeManager.setDraftEdge(ctx.node, ctx.node);
			this.#isDragging = true;
		}
	}

	handlePointerMove(ctx: EventContext): void {
		if (this.#isDragging) {
			if (ctx.node) {
				this.editorCtx.draftEdgeManager.updateDraftEdgeTarget(ctx.node);
			} else {
				this.editorCtx.draftEdgeManager.updateDraftEdgeTarget(ctx.pointerPos);
			}
		}
	}

	handlePointerUp(ctx: EventContext): void {
		this.#isDragging = false;
		if (ctx.node && this.editorCtx.draftEdgeManager.draftEdge) {
			const newEdge = this.editorCtx.draftEdgeManager.commitDraftEdge(ctx.node);
			if (newEdge) {
				this.editorCtx.selectionManager.selectItem(newEdge);
			}
		}
		this.editorCtx.draftEdgeManager.clearDraftEdge();
	}
}
