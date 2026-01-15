import { browser } from '$app/environment';
import { EditorManager } from '$lib/interaction/editor';
import { FSAGraph } from '$lib/automata/models';
import { Viewport } from '$lib/interaction';
import { UserFacingError } from '$lib/utils/errors';
import { notifyError, notifyWarning } from '$lib/utils/notifications.svelte';

type AppMode = 'editing' | 'simulating';

class AppManager {
	// core state
	private _mode = $state<AppMode>('editing');
	readonly fsaGraph: FSAGraph;
	readonly viewport: Viewport;

	// sub-managers
	readonly editor: EditorManager;
	// readonly simulationManager: SimulationManager;

	constructor() {
		this.fsaGraph = new FSAGraph();
		this.viewport = new Viewport();
		this.editor = new EditorManager(this.fsaGraph, this.viewport);
		// this.simulationManager = new SimulationManager();
	}

	isEditing(): boolean {
		return this._mode === 'editing';
	}

	isSimulating(): boolean {
		return this._mode === 'simulating';
	}

	// graph import/export

	async downloadGraph(): Promise<void> {
		if (this.fsaGraph.isEmpty) {
			throw new UserFacingError('Cannot download an empty graph.');
		}
		const filename = `${this.fsaGraph.title}.fsa`;
		const data = JSON.stringify(this.fsaGraph.toJSON());
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
		const json = JSON.parse(text);
		const backup = this.fsaGraph.toJSON();
		try {
			this.fsaGraph.loadFromJSON(json);
		} catch (error: unknown) {
			this.fsaGraph.loadFromJSON(backup);
			notifyError(error);
			notifyWarning('Invalid FSA data in the uploaded file, upload aborted.');
		}
	}

	// session management

	saveSession(): void {
		if (!browser) return;
		try {
			localStorage.setItem('working-fsa', JSON.stringify(this.fsaGraph.toJSON()));
			localStorage.setItem('viewport-state', JSON.stringify(this.viewport.toJSON()));
		} catch (error) {
			console.error('Failed to write to localStorage:', error);
		}
	}

	loadSession(): void {
		if (!browser) return;
		const savedGraph = localStorage.getItem('working-fsa');
		const savedViewport = localStorage.getItem('viewport-state');
		if (savedViewport) this.viewport.fromJSON(JSON.parse(savedViewport));
		if (savedGraph) this.fsaGraph.loadFromJSON(JSON.parse(savedGraph));
	}

	resetSession(): void {
		if (!browser) return;
		this.fsaGraph.reset();
		this.viewport.reset();
		this.saveSession();
	}
}

export const app = new AppManager();
