import { storage } from '$lib/utils/storage';
import { FSAGraph, type SerializedFSAGraph } from '$lib/automata/models';
import { Viewport, type SerializedViewport } from '$lib/interaction';
import { EditorManager } from '$lib/interaction/editor';
import { WindowManager, type SerializedWindowsState } from '$lib/interaction/Windows.svelte';

type AppMode = 'editing' | 'simulating';

/**
 * Main application manager, holding references to core components such as the FSA graph, viewport, editor and simulation manager. This is basically the representation of the whole application state.
 * It also manages application-wide operations such as session management and FSA import/export.
 */
export class AppManager {
	static readonly STORAGE_KEY_FSA = 'working-fsa';
	static readonly STORAGE_KEY_VIEWPORT = 'viewport-state';
	static readonly STORAGE_KEY_WINDOWS = 'windows-state';

	private _mode = $state<AppMode>('editing');
	readonly fsaGraph: FSAGraph;
	readonly viewport: Viewport;
	readonly windows: WindowManager;

	readonly editor: EditorManager;
	// readonly simulationManager: SimulationManager;

	constructor() {
		this.fsaGraph = new FSAGraph();
		this.viewport = new Viewport();
		this.editor = new EditorManager(this.fsaGraph, this.viewport);
		this.windows = new WindowManager();
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
	 * Checks if session storage can be used.
	 * @returns True if session storage is available, false otherwise.
	 */
	canUseSessionStorage(): boolean {
		return storage.isAvailable();
	}

	/**
	 * Saves the current session (FSA graph and viewport state).
	 */
	saveSession(): void {
		if (!storage.isAvailable()) return;
		storage.save(AppManager.STORAGE_KEY_FSA, this.fsaGraph.toJSON());
		storage.save(AppManager.STORAGE_KEY_VIEWPORT, this.viewport.toJSON());
		storage.save('windows-state', this.windows.toJSON());
	}

	/**
	 * Loads the session (FSA graph and viewport state).
	 */
	loadSession(): void {
		if (!storage.isAvailable()) return;
		const savedGraph = storage.load<SerializedFSAGraph>(AppManager.STORAGE_KEY_FSA);
		const savedViewport = storage.load<SerializedViewport>(AppManager.STORAGE_KEY_VIEWPORT);
		const savedWindows = storage.load<SerializedWindowsState>(AppManager.STORAGE_KEY_WINDOWS);
		if (savedViewport) this.viewport.loadFromJSON(savedViewport);
		if (savedGraph) this.fsaGraph.loadFromJSON(savedGraph);
		if (savedWindows) this.windows.loadFromJSON(savedWindows);
	}

	/**
	 * Resets the current session by clearing the FSA graph and viewport state. LocalStorage is then updated by saving the cleared state.
	 */
	resetSession(): void {
		if (!storage.isAvailable()) return;
		this.fsaGraph.reset();
		this.viewport.reset();
		this.windows.reset();
		storage.remove(AppManager.STORAGE_KEY_FSA);
		storage.remove(AppManager.STORAGE_KEY_VIEWPORT);
		storage.remove(AppManager.STORAGE_KEY_WINDOWS);
	}
}

export const app = new AppManager();
