import { State, type EventContext } from '$lib/application/interaction';

export class DrawEdgeState extends State {
	static readonly NAME = 'draw-edge';

	onExit() {
		this.editorCtx.draftEdgeManager.clearDraftEdge();
	}

	handleClick(ctx: EventContext): void {
		if (ctx.node) {
			this.editorCtx.draftEdgeManager.setDraftEdge(ctx.node, ctx.node);
			this.editorCtx.draftEdgeManager.commitDraftEdge(ctx.node);
		}
		this.editorCtx.draftEdgeManager.clearDraftEdge();
	}

	handleDragStart(ctx: EventContext): void {
		if (ctx.node && !this.editorCtx.draftEdgeManager.draftEdge) {
			this.editorCtx.draftEdgeManager.setDraftEdge(ctx.node, ctx.node);
		}
	}

	handleDragMove(ctx: EventContext): void {
		if (this.editorCtx.draftEdgeManager.draftEdge) {
			if (ctx.node) {
				this.editorCtx.draftEdgeManager.updateDraftEdgeTarget(ctx.node);
			} else {
				this.editorCtx.draftEdgeManager.updateDraftEdgeTarget(ctx.pointerPos);
			}
		}
	}

	handleDragEnd(ctx: EventContext): void {
		if (ctx.node && this.editorCtx.draftEdgeManager.draftEdge) {
			const newEdge = this.editorCtx.draftEdgeManager.commitDraftEdge(ctx.node);
			if (newEdge) {
				this.editorCtx.selectionManager.select(newEdge);
			}
		}
		this.editorCtx.draftEdgeManager.clearDraftEdge();
	}
}
