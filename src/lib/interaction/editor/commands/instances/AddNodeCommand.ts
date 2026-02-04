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

	constructor(nodePos: Point, id?: string) {
		super();
		this.data = { nodeId: id ?? Node.createId(), nodePos };
	}

	execute(fsa: FSAGraph): void {
		fsa.addNode(this.data.nodePos, this.data.nodeId);
	}

	undo(fsa: FSAGraph): void {
		if (fsa.getNodeFromId(this.data.nodeId) === null) {
			throw new Error(`[AddNodeCommand] node with id ${this.data.nodeId} does not exist.`);
		}
		fsa.deleteNode(this.data.nodeId);
	}

	toJSON(): { id: string; data: AddNodeData } {
		return {
			id: this.id,
			data: this.data
		};
	}

	static fromJSON(commandJson: { data: AddNodeData }): AddNodeCommand {
		return new AddNodeCommand(commandJson.data.nodePos, commandJson.data.nodeId);
	}
}

registerCommand(AddNodeCommand.ID, AddNodeCommand);
