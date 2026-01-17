import { browser } from '$app/environment';
import { EditorManager } from '$lib/interaction/editor';
import { FSAGraph } from '$lib/automata/models';
import { Viewport } from '$lib/interaction';

type AppMode = 'editing' | 'simulating';

/**
 * Main application manager, holding references to core components such as the FSA graph, viewport, editor and simulation manager. This is basically the representation of the whole application state.
 * It also manages application-wide operations such as session management and FSA import/export.
 */
export class AppManager {
	private _mode = $state<AppMode>('editing');
	readonly fsaGraph: FSAGraph;
	readonly viewport: Viewport;
	readonly editor: EditorManager;
	// readonly simulationManager: SimulationManager;

	constructor() {
		this.fsaGraph = new FSAGraph();
		this.viewport = new Viewport();
		this.editor = new EditorManager(this.fsaGraph, this.viewport);
		// this.simulationManager = new SimulationManager();
	}

	/**
	 * Checks if the app is currently in editor mode.
	 * @returns True if in editor mode, false otherwise.
	 */
	isEditing(): boolean {
		return this._mode === 'editing';
	}

	/**
	 * Checks if the app is currently in simulation mode.
	 * @returns True if in simulation mode, false otherwise.
	 */
	isSimulating(): boolean {
		return this._mode === 'simulating';
	}

	/**
	 * Saves the current session (FSA graph and viewport state) to localStorage.
	 */
	saveSession(): void {
		if (!browser) return;
		try {
			localStorage.setItem('working-fsa', JSON.stringify(this.fsaGraph.toJSON()));
			localStorage.setItem('viewport-state', JSON.stringify(this.viewport.toJSON()));
		} catch (error) {
			console.error('Failed to write to localStorage:', error);
		}
	}

	/**
	 * Loads the session (FSA graph and viewport state) from localStorage.
	 */
	loadSession(): void {
		if (!browser) return;
		const savedGraph = localStorage.getItem('working-fsa');
		const savedViewport = localStorage.getItem('viewport-state');
		if (savedViewport) this.viewport.loadFromJSON(JSON.parse(savedViewport));
		if (savedGraph) this.fsaGraph.loadFromJSON(JSON.parse(savedGraph));
	}

	/**
	 * Resets the current session by clearing the FSA graph and viewport state. LocalStorage is then updated by saving the cleared state.
	 */
	resetSession(): void {
		if (!browser) return;
		this.fsaGraph.reset();
		this.viewport.reset();
		this.saveSession();
	}
}

export const app = new AppManager();
