import { Node } from '$lib/automata-models';
import { AddNodeCommand } from '../../commands';
import { State, type EventContext } from '../State';

/**
 * State for adding a new node to the FSA graph.
 * - Single click on empty canvas: adds a new node at the clicked position and selects it.
 * - Dragging on empty canvas: creates a new node. While dragging, moves the node with the cursor. On drag end, selects the node.
 */
export class AddNodeState extends State {
	static readonly NAME = 'add-node';
	private _tempNode: Node | null = null;

	handleClick(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const command = new AddNodeCommand(ctx.pointerPos);
			this.editorCtx.commandHistory.pushAndExecute(command);
			this.editorCtx.selection.select(command.data.nodeId);
		}
	}

	handleDragStart(ctx: EventContext): void {
		if (ctx.isCanvas) {
			this._tempNode = this.editorCtx.fsaGraph.createNewNode(ctx.pointerPos, 'temp-node');
		}
	}

	handleDragMove(ctx: EventContext): void {
		if (this._tempNode) {
			this._tempNode.moveTo(ctx.pointerPos);
		}
	}

	handleDragEnd(_ctx: EventContext): void {
		if (this._tempNode) {
			const command = new AddNodeCommand(this._tempNode.pos, this._tempNode.id);
			this.editorCtx.commandHistory.push(command);
			this.editorCtx.selection.select(command.data.nodeId);
		}

		this._tempNode = null;
	}
}
