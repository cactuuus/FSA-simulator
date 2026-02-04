import { EditorState } from '$lib/interaction/editor/EditorState';
import type { EventContext } from '$lib/interaction/SvgInputHandler';
import { Node } from '$lib/automata/models';

/**
 * State for adding a new node to the FSA graph.
 * - Single click on empty canvas: adds a new node at the clicked position and selects it.
 * - Dragging on empty canvas: creates a new node. While dragging, moves the node with the cursor. On drag end, selects the node.
 */
export class AddNodeState extends EditorState {
	static readonly NAME = 'add-node';
	private _tempNode: Node | null = null;

	handleClick(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const newNode = this.editorCtx.fsaGraph.addNode(ctx.pointerPos);
			this.editorCtx.selection.select(newNode.id);
		}
	}

	handleDragStart(ctx: EventContext): void {
		if (ctx.isCanvas) {
			this._tempNode = this.editorCtx.fsaGraph.addNode(ctx.pointerPos);
		}
	}

	handleDragMove(ctx: EventContext): void {
		if (this._tempNode) {
			this._tempNode.moveTo(ctx.pointerPos);
		}
	}

	handleDragEnd(_ctx: EventContext): void {
		if (this._tempNode) {
			this.editorCtx.selection.select(this._tempNode.id);
		}

		this._tempNode = null;
	}
}
