import { EditorState } from './EditorState';
import type { EventContext } from '$lib/interaction/SvgInputHandler';

/**
 * State for drawing edges between nodes in the FSA graph.
 * - Single click on a node: creates a loop edge on that node.
 * - Dragging on a node: starts drawing a draft edge from that node. While dragging, the draft edge follows the cursor or snaps to another node if hovered. On drag end, if over a node, commits the edge to that target node.
 */
export class DrawEdgeState extends EditorState {
	static readonly NAME = 'draw-edge';

	onExit() {
		this.editorCtx.draftEdge.clear();
	}

	handleClick(ctx: EventContext): void {
		if (ctx.node) {
			this.editorCtx.draftEdge.new(ctx.node);
			const newEdge = this.editorCtx.draftEdge.commit(ctx.node);
			if (newEdge) {
				this.editorCtx.selection.select(newEdge);
			}
		}
		this.editorCtx.draftEdge.clear();
	}

	handleDragStart(ctx: EventContext): void {
		if (ctx.node && !this.editorCtx.draftEdge.get) {
			this.editorCtx.draftEdge.new(ctx.node);
		}
	}

	handleDragMove(ctx: EventContext): void {
		if (this.editorCtx.draftEdge.get) {
			if (ctx.node) {
				this.editorCtx.draftEdge.updateTarget(ctx.node);
			} else {
				this.editorCtx.draftEdge.updateTarget(ctx.pointerPos);
			}
		}
	}

	handleDragEnd(ctx: EventContext): void {
		if (ctx.node && this.editorCtx.draftEdge.get) {
			const newEdge = this.editorCtx.draftEdge.commit(ctx.node);
			if (newEdge) {
				this.editorCtx.selection.select(newEdge);
			}
		}
		this.editorCtx.draftEdge.clear();
	}
}
