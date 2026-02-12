import { FSAGraph } from '$lib/automata/models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface ToggleNodeAcceptingData {
	nodeId: string;
	toValue: boolean;
}

export class ToggleNodeAcceptingCommand extends Command<ToggleNodeAcceptingData> {
	static ID = 'toggle-node-accepting';
	id = ToggleNodeAcceptingCommand.ID;
	data: ToggleNodeAcceptingData;

	constructor(nodeId: string, toValue: boolean) {
		super();
		this.data = { nodeId, toValue };
	}

	execute(fsa: FSAGraph): void {
		const node = fsa.requireNode(this.data.nodeId);
		node.isAccepting = this.data.toValue;
	}

	undo(fsa: FSAGraph): void {
		const node = fsa.requireNode(this.data.nodeId);
		node.isAccepting = !this.data.toValue;
	}

	static fromJSON(commandJson: { data: ToggleNodeAcceptingData }): ToggleNodeAcceptingCommand {
		return new ToggleNodeAcceptingCommand(commandJson.data.nodeId, commandJson.data.toValue);
	}
}

registerCommand(ToggleNodeAcceptingCommand.ID, ToggleNodeAcceptingCommand);
