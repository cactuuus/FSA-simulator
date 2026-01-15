import {
	PanningState,
	SelectState,
	DrawEdgeState,
	AddNodeState
} from '$lib/interaction/editor/states';
import { EditorState, type EditorContext } from './states/EditorState';
import { SelectionHandler } from './SelectionHandler.svelte';
import { DraftEdgeHandler } from './DraftEdgeHandler.svelte';
import type { FSAGraph } from '$lib/automata/models/FSAGraph.svelte';
import type { Viewport } from '../Viewport.svelte';

export class EditorManager {
	readonly fsaGraph: FSAGraph;
	readonly viewport: Viewport;
	readonly selection: SelectionHandler;
	readonly draftEdge: DraftEdgeHandler;
	private _currentState = $state.raw<EditorState | null>(null);

	constructor(fsaGraph: FSAGraph, viewport: Viewport) {
		this.fsaGraph = fsaGraph;
		this.viewport = viewport;
		this.selection = new SelectionHandler(this.fsaGraph);
		this.draftEdge = new DraftEdgeHandler(this.fsaGraph);
		this.transitionTo(SelectState.NAME);
	}

	transitionTo(newState: string): void {
		this._currentState?.onExit?.();
		this._currentState = this.initialiseState(newState);
		this._currentState?.onEnter?.();
	}

	private initialiseState(stateName: string): EditorState {
		const editorContext: EditorContext = {
			fsaGraph: this.fsaGraph,
			viewport: this.viewport,
			selection: this.selection,
			draftEdge: this.draftEdge
		};

		switch (stateName) {
			case PanningState.NAME:
				return new PanningState(editorContext);
			case SelectState.NAME:
				return new SelectState(editorContext);
			case DrawEdgeState.NAME:
				return new DrawEdgeState(editorContext);
			case AddNodeState.NAME:
				return new AddNodeState(editorContext);
			default:
				throw new Error(`Unknown state: ${stateName}`);
		}
	}

	get currentState(): EditorState | null {
		return this._currentState;
	}
}
