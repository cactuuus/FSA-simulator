import type { Point, Size } from '$lib/utils/geometry';
import type { Serializable } from '$lib/utils/serialization';
import { SvelteMap } from 'svelte/reactivity';

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

export interface SerializedWindow {
	positionOverride: Point | null;
	sizeOverride: Size | null;
	isMinimized: boolean;
}

export interface SerializedWindowsState {
	[id: string]: SerializedWindow;
}

export class WindowManager implements Serializable<SerializedWindowsState> {
	private active = new SvelteMap<string, Window>();

	open(name: string): Window {
		if (!this.active.has(name)) {
			this.active.set(name, new Window());
		}
		return this.active.get(name)!;
	}

	isOpen(name: string): boolean {
		return this.active.has(name);
	}

	close(name: string): void {
		this.active.delete(name);
	}

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
