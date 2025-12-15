import { State, type EventContext } from '$lib/application/interaction';

export class AddNodeState extends State {
	static readonly NAME = 'add-node';

	handleClick(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const newNode = this.editorCtx.fsaGraph.addNode(ctx.pointerPos);
			this.editorCtx.selectionManager.select(newNode);
		}
	}
}
