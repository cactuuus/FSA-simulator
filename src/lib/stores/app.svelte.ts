import { FSAGraph } from '$lib/automata/models';
import { EditorManager, ViewportManager } from '$lib/application/managers';
import type { SerializedFSAGraph } from '$lib/automata/serialisation';
import { notifyError, notifyWarning, UserFacingError } from '$lib/utils';

type AppMode = 'editing' | 'simulating';

class AppManager {
	// core state
	private _fsaGraph = new FSAGraph();
	private _viewportManager = new ViewportManager();
	private _mode = $state<AppMode>('editing');
	title = $state<string>('Untitled');

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

	canDownloadGraph(): boolean {
		return !this._fsaGraph.isEmpty;
	}

	async downloadGraph(): Promise<void> {
		if (this._fsaGraph.isEmpty) {
			throw new UserFacingError('Cannot download an empty graph.');
		}

		const filename = `${this.title}.fsa`;
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
		const backup = this._fsaGraph.toJSON();

		try {
			this._fsaGraph.loadFromJSON(json);
			this.title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
			// TODO -- possibly need to reset editor/simulation state here
		} catch (error: unknown) {
			this._fsaGraph.loadFromJSON(backup);
			notifyError(error);
			notifyWarning('Invalid FSA data in the uploaded file, upload aborted.');
		}
	}
}

export const app = new AppManager();
