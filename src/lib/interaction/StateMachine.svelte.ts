import { SvelteMap } from 'svelte/reactivity';
import { State } from './State';

export class StateMachine<T extends State> {
	private _states: Map<string, T>;
	private _current = $state.raw<T>(null!); // workaround to avoid current being nullable

	constructor(states: T[], initialStateName: string) {
		this._states = new SvelteMap(states.map((state) => [state.name, state]));
		this._current = this.getState(initialStateName);
	}

	transitionTo(stateName: string): void {
		this._current.onExit();
		this._current = this.getState(stateName);
		this._current.onEnter();
	}

	private getState(stateName: string): T {
		const state = this._states.get(stateName);
		if (!state) throw new Error(`State '${stateName}' not found.`);
		return state;
	}

	get currentState(): T {
		return this._current;
	}
}
