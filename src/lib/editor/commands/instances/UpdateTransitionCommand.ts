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

export class UpdateTransitionCommand extends Command<UpdateTransitionData[]> {
	static ID = 'update-transition-command';
	id = UpdateTransitionCommand.ID;
	data: UpdateTransitionData[];

	constructor(...transitionsData: UpdateTransitionData[]) {
		super();
		this.data = transitionsData;
	}

	execute(fsa: FSAGraph): void {
		for (const { transitionId, to } of this.data) {
			const transition = fsa.requireTransition(transitionId);
			transition.consumeRawValue = to.rawConsume;
			transition.popRawValue = to.rawPop;
			transition.pushRawValue = to.rawPush;
		}
	}

	undo(fsa: FSAGraph): void {
		for (const { transitionId, from } of this.data) {
			const transition = fsa.requireTransition(transitionId);
			transition.consumeRawValue = from.rawConsume;
			transition.popRawValue = from.rawPop;
			transition.pushRawValue = from.rawPush;
		}
	}

	static fromJSON(commandJson: { data: UpdateTransitionData[] }): UpdateTransitionCommand {
		return new UpdateTransitionCommand(...commandJson.data);
	}
}

registerCommand(UpdateTransitionCommand.ID, UpdateTransitionCommand);
