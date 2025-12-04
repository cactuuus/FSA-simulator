import { State } from '$lib/states';
import { editor } from '$lib/stores/editor.svelte';
import type { EventContext } from '$lib/utils';

export class AddNodeState extends State {
	static readonly NAME = 'add-node';

	handleClick(ctx: EventContext): void {
		if (ctx.isCanvas) {
			const newNode = editor.fsaGraph.addNode(ctx.mousePos);
			editor.selectItem(newNode);
		}
	}
}
