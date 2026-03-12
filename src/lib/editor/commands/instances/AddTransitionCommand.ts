import { FSAGraph, Transition } from '$lib/automata-models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface AddTransitionData {
	edgeId: string;
	transitionId: string;
	withStackOps: boolean;
}

export class AddTransitionCommand extends Command<AddTransitionData> {
	static ID = 'add-transition-command';
	id = AddTransitionCommand.ID;
	data: AddTransitionData;

	constructor(edgeId: string, withStackOps: boolean, transitionId?: string) {
		super();
		this.data = { edgeId, transitionId: transitionId ?? Transition.createId(), withStackOps };
	}

	execute(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.addEmptyTransition(this.data.withStackOps, this.data.transitionId);
	}

	undo(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.deleteTransitions(this.data.transitionId);
	}

	static fromJSON(commandJson: { data: AddTransitionData }): AddTransitionCommand {
		return new AddTransitionCommand(
			commandJson.data.edgeId,
			commandJson.data.withStackOps,
			commandJson.data.transitionId
		);
	}
}

registerCommand(AddTransitionCommand.ID, AddTransitionCommand);
