import { Node } from '$lib/automata-models';
import { AddNodeCommand } from '../../commands';
import { State, type EventContext } from '../State';
import { type EditorContext } from '../../EditorContext';

/**
 * State for adding a new node to the FSA graph.
 * - Single click on empty canvas: adds a new node at the clicked position and selects it.
 * - Dragging on empty canvas: creates a new node. While dragging, moves the node with the cursor. On drag end, selects the node.
 */
export class AddNodeState extends State {
	static readonly NAME = 'add-node';
	private _onNodeClickedCallback: () => void = () => {};
	private _tempNode: Node | null = null;

	constructor(editorContext: EditorContext, onNodeClickedCallback: () => void) {
		super(editorContext);
		this._onNodeClickedCallback = onNodeClickedCallback;
	}

	handleClick(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const command = new AddNodeCommand(ctx.pointerPos);
			this.editorCtx.commandHistory.pushAndExecute(command);
			this.editorCtx.selection.select(command.data.nodeId);
			return;
		}

		const item = ctx.node || ctx.edge;
		if (item) {
			this.editorCtx.selection.select(item.id);
			this._onNodeClickedCallback();
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
