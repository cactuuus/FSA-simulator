import { FSAGraph } from '$lib/automata-models';
import { Command } from '../base';
import { registerCommand } from '../registry';

interface TransitionData {
	rawConsume: string;
	rawPop: string | null;
	rawPush: string | null;
}

export interface UpdateTransitionData {
	transitionId: string;
	from: TransitionData;
	to: TransitionData;
}

export class UpdateTransitionCommand extends Command<UpdateTransitionData> {
	static ID = 'update-transition-command';
	id = UpdateTransitionCommand.ID;
	data: UpdateTransitionData;

	constructor(transitionId: string, from: TransitionData, to: TransitionData) {
		super();
		this.data = { transitionId, from, to };
	}

	execute(fsa: FSAGraph): void {
		const transition = fsa.requireTransition(this.data.transitionId);
		transition.consumeRawValue = this.data.to.rawConsume;
		transition.popRawValue = this.data.to.rawPop;
		transition.pushRawValue = this.data.to.rawPush;
	}

	undo(fsa: FSAGraph): void {
		const transition = fsa.requireTransition(this.data.transitionId);
		transition.consumeRawValue = this.data.from.rawConsume;
		transition.popRawValue = this.data.from.rawPop;
		transition.pushRawValue = this.data.from.rawPush;
	}

	static fromJSON(commandJson: { data: UpdateTransitionData }): UpdateTransitionCommand {
		return new UpdateTransitionCommand(
			commandJson.data.transitionId,
			commandJson.data.from,
			commandJson.data.to
		);
	}
}

registerCommand(UpdateTransitionCommand.ID, UpdateTransitionCommand);
