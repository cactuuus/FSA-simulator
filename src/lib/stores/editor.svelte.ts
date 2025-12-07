import { FSAGraph } from '$lib/automata/models';
import {
	type EditorContext,
	State,
	PanningState,
	SelectState,
	DrawEdgeState,
	AddNodeState
} from '$lib/application/interaction';
import { ViewportManager, SelectionManager, DraftEdgeManager } from '$lib/application/managers';

class EditorManager {
	private _fsaGraph = new FSAGraph();
	private _viewportManager = new ViewportManager();
	readonly selectionManager = new SelectionManager(this._fsaGraph);
	readonly draftEdgeManager = new DraftEdgeManager(this._fsaGraph);
	private _currentState = $state.raw<State | null>(null);

	transitionTo(newState: string): void {
		this._currentState?.onExit?.();
		this._currentState = this.initialiseState(newState);
		this._currentState?.onEnter?.();
		console.debug(`Transitioned to state: ${newState}`);
	}

	private initialiseState(stateName: string): State {
		const editorContext: EditorContext = {
			fsaGraph: this._fsaGraph,
			selectionManager: this.selectionManager,
			draftEdgeManager: this.draftEdgeManager,
			viewportManager: this._viewportManager
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

	get fsaGraph(): FSAGraph {
		return this._fsaGraph;
	}

	get viewportManager(): ViewportManager {
		return this._viewportManager;
	}

	get currentState(): State | null {
		return this._currentState;
	}
}

export const editor = new EditorManager();
