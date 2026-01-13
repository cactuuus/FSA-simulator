import { State } from '$lib/application/interaction/State';
import type { EventContext } from '$lib/application/interaction/types';
import { Node } from '$lib/automata/models';
import { fsaGraph } from '$lib/stores/fsa.svelte';

export class AddNodeState extends State {
	static readonly NAME = 'add-node';
	private _node: Node | null = null;

	handleClick(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const newNode = fsaGraph.addNode(ctx.pointerPos);
			this.editorCtx.selectionManager.select(newNode);
		}
	}

	handleDragStart(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const newNode = fsaGraph.addNode(ctx.pointerPos);
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
			this.editorCtx.selectionManager.select(this._node);
		}
		this._node = null;
	}
}
