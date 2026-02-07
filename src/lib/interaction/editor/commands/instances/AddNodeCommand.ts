import type { Point } from '$lib/utils/geometry';
import { FSAGraph, Node } from '$lib/automata/models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface AddNodeData {
	nodeId: string;
	nodePos: Point;
}

export class AddNodeCommand extends Command<AddNodeData> {
	static ID = 'add-node';
	id = AddNodeCommand.ID;
	data: AddNodeData;

	constructor(nodePos: Point, nodeId?: string) {
		super();
		this.data = { nodeId: nodeId ?? Node.createId(), nodePos };
	}

	execute(fsa: FSAGraph): void {
		fsa.createNewNode(this.data.nodePos, this.data.nodeId);
	}

	undo(fsa: FSAGraph): void {
		fsa.deleteNode(this.data.nodeId);
	}

	static fromJSON(commandJson: { data: AddNodeData }): AddNodeCommand {
		return new AddNodeCommand(commandJson.data.nodePos, commandJson.data.nodeId);
	}
}

registerCommand(AddNodeCommand.ID, AddNodeCommand);
