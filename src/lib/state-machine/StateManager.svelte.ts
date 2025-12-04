import {
	AddNodeState,
	DrawEdgeState,
	PanningState,
	SelectState,
	type State
} from '$lib/state-machine';

export class StateManager {
	#currentState = $state.raw<State | null>(null);

	get currentState(): State | null {
		return this.#currentState;
	}

	transitionTo(newState: string): void {
		this.#currentState?.onExit?.();
		this.#currentState = this.initialiseState(newState);
		this.#currentState?.onEnter?.();
		console.debug(`Transitioned to state: ${newState}`);
	}

	private initialiseState(stateName: string): State {
		switch (stateName) {
			case PanningState.NAME:
				return new PanningState();
			case SelectState.NAME:
				return new SelectState();
			case DrawEdgeState.NAME:
				return new DrawEdgeState();
			case AddNodeState.NAME:
				return new AddNodeState();
			default:
				throw new Error(`Unknown state: ${stateName}`);
		}
	}
}
