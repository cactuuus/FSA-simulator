import { fsaGraph } from './fsa.svelte';
import { FSAGraph } from '$lib/automata/models';
import { EditorManager } from '$lib/application/managers';

type AppMode = 'editing' | 'simulating';

class AppManager {
	// core state
	private _mode = $state<AppMode>('editing');

	// sub-managers
	private _editorManager: EditorManager;
	// readonly simulationManager: SimulationManager;

	constructor() {
		this._editorManager = new EditorManager();
		// this.simulationManager = new SimulationManager();
	}

	get fsaGraph(): FSAGraph {
		return fsaGraph;
	}

	get editor(): EditorManager {
		return this._editorManager;
	}

	isEditing(): boolean {
		return this._mode === 'editing';
	}

	isSimulating(): boolean {
		return this._mode === 'simulating';
	}
}

export const app = new AppManager();
