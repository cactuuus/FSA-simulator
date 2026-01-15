import { EditorState } from './EditorState';
import type { EventContext } from '$lib/interaction/SvgInputHandler';
import { Node } from '$lib/automata/models';

export class AddNodeState extends EditorState {
	static readonly NAME = 'add-node';
	private _node: Node | null = null;

	handleClick(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const newNode = this.editorCtx.fsaGraph.addNode(ctx.pointerPos);
			this.editorCtx.selection.select(newNode);
		}
	}

	handleDragStart(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const newNode = this.editorCtx.fsaGraph.addNode(ctx.pointerPos);
			this._node = newNode;
		}
	}

	handleDragMove(ctx: EventContext): void {
		if (this._node) {
			this._node.moveTo(ctx.pointerPos);
		}
	}

	handleDragEnd(_ctx: EventContext): void {
		if (this._node) {
			this.editorCtx.selection.select(this._node);
		}
		this._node = null;
	}
}
