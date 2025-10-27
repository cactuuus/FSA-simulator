import type { State } from '$lib/state-machine';

export class StateManager {
	#currentState = $state.raw<State | null>(null);

	get currentState(): State | null {
		return this.#currentState;
	}

	transitionTo(newState: State) {
		this.#currentState?.onExit?.();
		this.#currentState = newState;
		this.#currentState?.onEnter?.();
		console.debug(`Transitioned to state: ${newState.name}`);
	}
}
