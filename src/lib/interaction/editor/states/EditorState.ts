import { State } from '$lib/interaction';
import type { FSAGraph } from '$lib/automata/models/FSAGraph.svelte';
import type { Viewport } from '$lib/interaction/Viewport.svelte';
import type { SelectionHandler } from '$lib/interaction/editor/SelectionHandler.svelte';
import type { DraftEdgeHandler } from '$lib/interaction/editor/DraftEdgeHandler.svelte';

/**
 * Abstract base class for editor states, extending the generic State class.
 * Each editor state has access to the editor context, which is the place where to include all core components needed by editor states.
 */
export abstract class EditorState extends State {
	protected editorCtx: EditorContext;

	constructor(editorContext: EditorContext) {
		super();
		this.editorCtx = editorContext;
	}
}

/**
 * Context for the editor, providing access to core components needed by editor states.
 */
export interface EditorContext {
	fsaGraph: FSAGraph;
	viewport: Viewport;
	selection: SelectionHandler;
	draftEdge: DraftEdgeHandler;
}
