import type { Point, Size } from '$lib/utils/geometry';
import type { Serializable } from '$lib/utils/serialization';
import { SvelteMap } from 'svelte/reactivity';

/**
 * Reference map of windows by their unique names.
 */
export const WINDOWS_ID = {
	TransitionTable: 'transition-table-window',
	ComputeInput: 'compute-input-window',
	GraphInfo: 'graph-info-window'
} as const;

/**
 * Represents the state of a window.
 */
export class Window implements Serializable<SerializedWindow> {
	positionOverride: Point | null = $state(null);
	sizeOverride: Size | null = $state(null);
	isMinimized: boolean = $state(false);

	toJSON(): SerializedWindow {
		return {
			positionOverride: this.positionOverride,
			sizeOverride: this.sizeOverride,
			isMinimized: this.isMinimized
		};
	}

	static fromJSON(json: SerializedWindow): Window {
		const window = new Window();
		window.positionOverride = json.positionOverride ?? null;
		window.sizeOverride = json.sizeOverride ?? null;
		window.isMinimized = json.isMinimized ?? false;
		return window;
	}
}

/**
 * Serialized representation of a window's state.
 */
export interface SerializedWindow {
	positionOverride: Point | null;
	sizeOverride: Size | null;
	isMinimized: boolean;
}

/**
 * Serialized representation of multiple windows' states.
 */
export interface SerializedWindowsState {
	[id: string]: SerializedWindow;
}

/**
 * Manages a collection of windows. Useful for tracking open windows and their states, as a single point of reference within the application.
 */
export class WindowManager implements Serializable<SerializedWindowsState> {
	private active = new SvelteMap<string, Window>();

	/**
	 * Opens a window with the given name (if not already open), then returns it.
	 * @param name Name of the window to open.
	 * @returns The opened window.
	 */
	open(name: string): Window {
		if (!this.active.has(name)) {
			this.active.set(name, new Window());
		}
		return this.active.get(name)!;
	}

	/**
	 * Checks if a window with the given name is currently open.
	 * @param name Name of the window to check.
	 * @returns True if the window is open, false otherwise.
	 */
	isOpen(name: string): boolean {
		return this.active.has(name);
	}

	/**
	 * Closes the window with the given name.
	 * @param name Name of the window to close.
	 */
	close(name: string): void {
		this.active.delete(name);
	}

	/**
	 * Closes all open windows.
	 */
	reset(): void {
		this.active.clear();
	}

	toJSON(): SerializedWindowsState {
		const json: SerializedWindowsState = {};
		for (const [id, window] of this.active.entries()) {
			json[id] = window.toJSON();
		}
		return json;
	}

	loadFromJSON(json: SerializedWindowsState): void {
		this.active.clear();
		for (const [id, state] of Object.entries(json)) {
			const windowState = Window.fromJSON(state);
			this.active.set(id, windowState);
		}
	}
}
