import type { FSAGraph } from '$lib/automata-models';
import type { Viewport } from './viewport/Viewport.svelte';
import type { SelectionHandler } from './selection/SelectionHandler.svelte';
import type { DraftEdgeHandler } from './draft-edge/DraftEdgeHandler.svelte';
import type { CommandHistory } from './commands/CommandHistory.svelte';

/**
 * Helper interface to group all core components of the editor/app.
 */
export interface EditorContext {
	fsaGraph: FSAGraph;
	viewport: Viewport;
	selection: SelectionHandler;
	draftEdge: DraftEdgeHandler;
	commandHistory: CommandHistory;
}
