import { State, type EventContext } from '$lib/application/interaction';
import { editor } from '$lib/stores/editor.svelte';

export class AddNodeState extends State {
	static readonly NAME = 'add-node';

	handleClick(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const newNode = editor.fsaGraph.addNode(ctx.mousePos);
			editor.selectionManager.selectItem(newNode);
		}
	}
}
