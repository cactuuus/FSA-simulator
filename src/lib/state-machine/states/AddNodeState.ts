import { State, type EventContext } from '$lib/state-machine';
import { editor } from '$lib/stores/editor.svelte';

export class AddNodeState extends State {
	readonly name = 'add-node';

	handleClick(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const newNode = editor.fsaGraph.addNode(ctx.mousePos);
			editor.selectItem(newNode);
		}
	}
}
