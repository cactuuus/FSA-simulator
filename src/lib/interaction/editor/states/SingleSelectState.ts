import { EditorState } from '$lib/interaction/editor/EditorState';
import type { EventContext } from '$lib/interaction/SvgInputHandler';

/**
 * Simple version of the select state that only allows for single selection. Clicking on an item selects it, while clicking on empty space clears the selection.
 */
export class SingleSelectState extends EditorState {
	static readonly NAME = 'single-select';

	handleClick(ctx: EventContext): void {
		const item = ctx.node || ctx.edge;
		if (item) {
			this.editorCtx.selection.select(item.id);
		} else {
			this.editorCtx.selection.clear();
		}
	}
}
