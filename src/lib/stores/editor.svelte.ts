import { FSAGraph } from '$lib/automata/models';
import {
	StateManager,
	ViewportManager,
	SelectionManager,
	DraftEdgeManager
} from '$lib/application/managers';

class EditorManager {
	private _fsaGraph = new FSAGraph();
	private _stateManager = new StateManager();
	private _viewportManager = new ViewportManager();
	readonly selectionManager = new SelectionManager(this._fsaGraph);
	readonly draftEdgeManager = new DraftEdgeManager(this._fsaGraph);

	get fsaGraph(): FSAGraph {
		return this._fsaGraph;
	}

	get stateManager(): StateManager {
		return this._stateManager;
	}

	get viewportManager(): ViewportManager {
		return this._viewportManager;
	}
}

export const editor = new EditorManager();
