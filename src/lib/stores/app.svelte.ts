import { FSAGraph } from '$lib/automata/models';
import { EditorManager, ViewportManager } from '$lib/application/managers';
import type { SerializedFSAGraph } from '$lib/automata/serialisation';

type AppMode = 'editing' | 'simulating';

class AppManager {
	// core state
	private _fsaGraph = new FSAGraph();
	private _viewportManager = new ViewportManager();
	private _mode = $state<AppMode>('editing');
	private _currentFilename = $state<string | null>(null);

	// sub-managers
	private _editorManager: EditorManager;
	// readonly simulationManager: SimulationManager;

	constructor() {
		this._editorManager = new EditorManager(this._fsaGraph, this._viewportManager);
		// this.simulationManager = new SimulationManager();
	}

	get fsaGraph(): FSAGraph {
		return this._fsaGraph;
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

	async downloadGraph(): Promise<void> {
		const filename = this._currentFilename ?? 'fsa-graph.json';
		const data = JSON.stringify(this._fsaGraph.toJSON());
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();

		URL.revokeObjectURL(url);
	}

	async uploadGraph(file: File): Promise<void> {
		const text = await file.text();
		const json = JSON.parse(text) as SerializedFSAGraph;
		this._fsaGraph.loadFromJSON(json);
		// TODO -- possibly need to reset editor/simulation state here
		this._currentFilename = file.name;
	}
}

export const app = new AppManager();
