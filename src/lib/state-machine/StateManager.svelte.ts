import type { State } from '../types';

export class StateManager<TState extends State = State> {
	private _currentState = $state.raw<TState | null>(null);
	private readonly _states: Map<string, TState>;

	constructor(states: TState[]) {
		// disable lint warning, our states map is readonly, no need for reactivity
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		this._states = new Map(states.map((state) => [state.name, state]));
	}

	get currentState(): TState | null {
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
		console.debug(`entered state ${newState.name}`);
	}
}
