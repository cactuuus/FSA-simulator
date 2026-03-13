import { storage } from '$lib/utils/storage';
import { FSAGraph, type SerializedFSAGraph } from '$lib/automata-models';
import { DesiredAlphabet, type SerializedDesiredAlphabet } from '$lib/transition-table';
import { Viewport, type SerializedViewport } from '$lib/editor/viewport';
import { CommandHistory, type SerializedCommandHistory } from '$lib/editor/commands';
import { WindowManager, type SerializedWindowsState } from '$lib/windows';
import { SelectionHandler } from '$lib/editor/selection';
import { SimulationController } from '$lib/simulation';

type AppMode = 'editing' | 'simulating';

/**
 * Main application manager, holding references to core components such as the FSA graph, viewport, editor and simulation manager. This is basically the representation of the whole application state.
 * It also manages application-wide operations such as session management and FSA import/export.
 */
export class AppManager {
	static readonly STORAGE_KEY_FSA = 'working-fsa';
	static readonly STORAGE_KEY_VIEWPORT = 'viewport-state';
	static readonly STORAGE_KEY_WINDOWS = 'windows-state';
	static readonly STORAGE_KEY_DESIRED_ALPHABET = 'desired-alphabet';
	static readonly STORAGE_KEY_COMMAND_HISTORY = 'command-history';

	private _mode = $state<AppMode>('editing');
	readonly simulationController: SimulationController;
	readonly desiredAlphabet: DesiredAlphabet;
	readonly commandHistory: CommandHistory;
	readonly fsaGraph: FSAGraph;
	readonly viewport: Viewport;
	readonly windows: WindowManager;
	readonly selectionHandler: SelectionHandler;

	constructor() {
		this.fsaGraph = new FSAGraph();
		this.viewport = new Viewport();
		this.desiredAlphabet = new DesiredAlphabet();
		this.commandHistory = new CommandHistory(this.fsaGraph);
		this.windows = new WindowManager();
		this.selectionHandler = new SelectionHandler(this.fsaGraph);
		this.simulationController = new SimulationController();
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

	exitSimulation(): void {
		this._mode = 'editing';
		this.simulationController.clearSelection();
	}

	enterSimulation(): void {
		this._mode = 'simulating';
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
		storage.save(AppManager.STORAGE_KEY_WINDOWS, this.windows.toJSON());
		storage.save(AppManager.STORAGE_KEY_DESIRED_ALPHABET, this.desiredAlphabet.toJSON());
		storage.save(AppManager.STORAGE_KEY_COMMAND_HISTORY, this.commandHistory.toJSON());
	}

	/**
	 * Loads the session (FSA graph and viewport state).
	 */
	loadSession(): void {
		if (!storage.isAvailable()) return;
		const savedGraph = storage.load<SerializedFSAGraph>(AppManager.STORAGE_KEY_FSA);
		const savedViewport = storage.load<SerializedViewport>(AppManager.STORAGE_KEY_VIEWPORT);
		const savedWindows = storage.load<SerializedWindowsState>(AppManager.STORAGE_KEY_WINDOWS);
		const savedDesiredAlphabet = storage.load<SerializedDesiredAlphabet>(
			AppManager.STORAGE_KEY_DESIRED_ALPHABET
		);
		const savedCommandHistory = storage.load<SerializedCommandHistory>(
			AppManager.STORAGE_KEY_COMMAND_HISTORY
		);
		if (savedViewport) this.viewport.loadFromJSON(savedViewport);
		if (savedGraph) this.fsaGraph.loadFromJSON(savedGraph);
		if (savedWindows) this.windows.loadFromJSON(savedWindows);
		if (savedDesiredAlphabet) this.desiredAlphabet.loadFromJSON(savedDesiredAlphabet);
		if (savedCommandHistory) this.commandHistory.loadFromJSON(savedCommandHistory);
	}

	/**
	 * Resets the current session by clearing the FSA graph and viewport state. LocalStorage is then updated by saving the cleared state.
	 */
	resetSession(): void {
		if (!storage.isAvailable()) return;
		this.fsaGraph.reset();
		this.viewport.reset();
		this.windows.reset();
		this.desiredAlphabet.reset();
		this.commandHistory.reset();
		storage.remove(AppManager.STORAGE_KEY_FSA);
		storage.remove(AppManager.STORAGE_KEY_VIEWPORT);
		storage.remove(AppManager.STORAGE_KEY_WINDOWS);
		storage.remove(AppManager.STORAGE_KEY_DESIRED_ALPHABET);
		storage.remove(AppManager.STORAGE_KEY_COMMAND_HISTORY);
	}
}

export const app = new AppManager();
