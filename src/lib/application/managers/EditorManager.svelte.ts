import {
	type EditorContext,
	State,
	PanningState,
	SelectState,
	DrawEdgeState,
	AddNodeState
} from '$lib/application/interaction';
import { SelectionManager } from '$lib/application/managers/SelectionManager.svelte';
import { DraftEdgeManager } from '$lib/application/managers/DraftEdgeManager.svelte';

export class EditorManager {
	readonly selectionManager: SelectionManager;
	readonly draftEdgeManager: DraftEdgeManager;
	private _currentState = $state.raw<State | null>(null);

	constructor() {
		this.selectionManager = new SelectionManager();
		this.draftEdgeManager = new DraftEdgeManager();
		this.transitionTo(SelectState.NAME);
	}

	transitionTo(newState: string): void {
		this._currentState?.onExit?.();
		this._currentState = this.initialiseState(newState);
		this._currentState?.onEnter?.();
	}

	private initialiseState(stateName: string): State {
		const editorContext: EditorContext = {
			selectionManager: this.selectionManager,
			draftEdgeManager: this.draftEdgeManager
		};

		switch (stateName) {
			case PanningState.NAME:
				return new PanningState(editorContext);
			case SelectState.NAME:
				return new SelectState(editorContext);
			case DrawEdgeState.NAME:
				return new DrawEdgeState(editorContext);
			case AddNodeState.NAME:
				return new AddNodeState(editorContext);
			default:
				throw new Error(`Unknown state: ${stateName}`);
		}
	}

	get currentState(): State | null {
		return this._currentState;
	}
}
