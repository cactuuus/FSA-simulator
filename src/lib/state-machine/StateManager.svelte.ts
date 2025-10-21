import type { FSA } from '$lib/fsa/FSA.svelte';
import type { CanvasState, Point } from '../types';

export class StateManager {
	private _currentState = $state.raw<CanvasState | null>(null);
	private readonly _states: Map<string, CanvasState>;
	private _fsa: FSA;

	constructor(fsa: FSA, states: CanvasState[]) {
		this._fsa = fsa;
		// disable lint warning, our states map is readonly, no need for reactivity
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		this._states = new Map(states.map((state) => [state.name, state]));
		console.log(fsa);
	}

	get currentState(): CanvasState | null {
		return this._currentState;
	}

	transition(stateName: string) {
		const newState = this._states.get(stateName);
		if (!newState) {
			console.warn(`State ${stateName} not found`);
			return;
		}

		this._currentState?.onExit?.(this._fsa);
		this._currentState = newState;
		this._currentState?.onEnter?.(this._fsa);
		console.debug(`entered state ${newState.name}`);
	}

	handleMouseDown(pos: Point) {
		this._currentState?.onMouseDown?.(pos, this._fsa);
	}

	handleMouseMove(pos: Point) {
		this._currentState?.onMouseMove?.(pos, this._fsa);
	}

	handleMouseUp(pos: Point) {
		this._currentState?.onMouseUp?.(pos, this._fsa);
	}

	handleClick(pos: Point) {
		this._currentState?.onClick?.(pos, this._fsa);
	}
}
