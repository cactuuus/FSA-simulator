import { EditorState } from './EditorState';
import type { EventContext } from '$lib/interaction/SvgInputHandler';

export class DrawEdgeState extends EditorState {
	static readonly NAME = 'draw-edge';

	onExit() {
		this.editorCtx.draftEdge.clear();
	}

	handleClick(ctx: EventContext): void {
		if (ctx.node) {
			this.editorCtx.draftEdge.new(ctx.node, ctx.node);
			const newEdge = this.editorCtx.draftEdge.commit(ctx.node);
			if (newEdge) {
				this.editorCtx.selection.select(newEdge);
			}
		}
		this.editorCtx.draftEdge.clear();
	}

	handleDragStart(ctx: EventContext): void {
		if (ctx.node && !this.editorCtx.draftEdge.draftEdge) {
			this.editorCtx.draftEdge.new(ctx.node, ctx.node);
		}
	}

	handleDragMove(ctx: EventContext): void {
		if (this.editorCtx.draftEdge.draftEdge) {
			if (ctx.node) {
				this.editorCtx.draftEdge.updateTarget(ctx.node);
			} else {
				this.editorCtx.draftEdge.updateTarget(ctx.pointerPos);
			}
		}
	}

	handleDragEnd(ctx: EventContext): void {
		if (ctx.node && this.editorCtx.draftEdge.draftEdge) {
			const newEdge = this.editorCtx.draftEdge.commit(ctx.node);
			if (newEdge) {
				this.editorCtx.selection.select(newEdge);
			}
		}
		this.editorCtx.draftEdge.clear();
	}
}
