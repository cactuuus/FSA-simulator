import { FSAGraph } from '$lib/automata-models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface UpdateNodeLabelData {
	nodeId: string;
	from: string;
	to: string;
}

export class UpdateNodeLabelCommand extends Command<UpdateNodeLabelData> {
	static ID = 'update-node-label-command';
	id = UpdateNodeLabelCommand.ID;
	data: UpdateNodeLabelData;

	constructor(nodeId: string, from: string, to: string) {
		super();
		this.data = { nodeId, from, to };
	}

	execute(fsa: FSAGraph): void {
		const node = fsa.requireNode(this.data.nodeId);
		node.label = this.data.to;
	}

	undo(fsa: FSAGraph): void {
		const node = fsa.requireNode(this.data.nodeId);
		node.label = this.data.from;
	}

	static fromJSON(commandJson: { data: UpdateNodeLabelData }): UpdateNodeLabelCommand {
		return new UpdateNodeLabelCommand(
			commandJson.data.nodeId,
			commandJson.data.from,
			commandJson.data.to
		);
	}
}

registerCommand(UpdateNodeLabelCommand.ID, UpdateNodeLabelCommand);
