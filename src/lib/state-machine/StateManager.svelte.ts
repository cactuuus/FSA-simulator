import type { State } from '$lib/state-machine';

export class StateManager {
	private _currentState = $state.raw<State | null>(null);
	private readonly _states: Map<string, State>;

	constructor(states: State[]) {
		// disable lint warning, our states map is readonly, no need for reactivity
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		this._states = new Map(states.map((state) => [state.name, state]));
	}

	get currentState(): State | null {
		return this._currentState;
	}

	transition(stateName: string) {
		const newState = this._states.get(stateName);
		if (!newState) {
			console.warn(`State ${stateName} not found`);
			return;
		}

		this._currentState?.onExit?.();
		this._currentState = newState;
		this._currentState?.onEnter?.();
	}
}
