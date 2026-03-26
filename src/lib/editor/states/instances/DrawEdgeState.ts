import { AddEdgeCommand } from '../../commands';
import { State, type EventContext } from '../State';

/**
 * State for drawing edges between nodes in the FSA graph.
 * - Single click on a node: creates a loop edge on that node.
 * - Dragging on a node: starts drawing a draft edge from that node. While dragging, the draft edge follows the cursor or snaps to another node if hovered. On drag end, if over a node, commits the edge to that target node.
 */
export class DrawEdgeState extends State {
	static readonly NAME = 'draw-edge';

	addAndSelectEdge(sourceId: string, targetId: string) {
		const command = new AddEdgeCommand(sourceId, targetId);
		this.editorCtx.commandHistory.pushAndExecute(command);
		this.editorCtx.selection.select(command.data.edgeId);
	}

	onExit() {
		this.editorCtx.draftEdge.clear();
	}

	handleClick(ctx: EventContext): void {
		if (ctx.node) {
			this.editorCtx.draftEdge.new(ctx.node);
			if (!this.editorCtx.draftEdge.isDuplicate) {
				this.addAndSelectEdge(ctx.node.id, ctx.node.id);
			}
		}
		// clear selection and any draft edge when clicking anywhere else
		this.editorCtx.selection.clear();
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
			if (!this.editorCtx.draftEdge.isDuplicate) {
				this.addAndSelectEdge(this.editorCtx.draftEdge.get.from.id, ctx.node.id);
			}
		}
		this.editorCtx.draftEdge.clear();
	}
}
