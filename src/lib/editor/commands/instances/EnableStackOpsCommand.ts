import { FSAGraph } from '$lib/automata-models';
import { Command } from '../base';
import { registerCommand } from '../registry';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EnableStackOpsData {
	// nothing needed
}

export class EnableStackOpsCommand extends Command<EnableStackOpsData> {
	static ID = 'enable-stack-ops';
	id = EnableStackOpsCommand.ID;
	data: EnableStackOpsData;

	constructor() {
		super();
		this.data = {};
	}

	execute(fsa: FSAGraph): void {
		fsa.hasStackOps = true;
		// since we're enabling stack ops, all transitions will be empty, so we don't need to store any previous data for undo
	}

	undo(fsa: FSAGraph): void {
		fsa.hasStackOps = false;
	}

	static fromJSON(_commandJson: { data: EnableStackOpsData }): EnableStackOpsCommand {
		return new EnableStackOpsCommand();
	}
}

registerCommand(EnableStackOpsCommand.ID, EnableStackOpsCommand);
