import { Edge, FSAGraph } from '$lib/automata/models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface AddEdgeData {
	edgeId: string;
	sourceId: string;
	targetId: string;
}

export class AddEdgeCommand extends Command<AddEdgeData> {
	static ID = 'add-edge';
	id = AddEdgeCommand.ID;
	data: AddEdgeData;

	constructor(sourceId: string, targetId: string, edgeId?: string) {
		super();
		this.data = { edgeId: edgeId ?? Edge.createId(sourceId, targetId), sourceId, targetId };
	}

	execute(fsa: FSAGraph): void {
		const sourceNode = fsa.requireNode(this.data.sourceId);
		const targetNode = fsa.requireNode(this.data.targetId);
		fsa.createNewEdge(sourceNode, targetNode, this.data.edgeId);
	}

	undo(fsa: FSAGraph): void {
		fsa.deleteEdge(this.data.edgeId);
	}

	static fromJSON(commandJson: { data: AddEdgeData }): AddEdgeCommand {
		return new AddEdgeCommand(
			commandJson.data.sourceId,
			commandJson.data.targetId,
			commandJson.data.edgeId
		);
	}
}

registerCommand(AddEdgeCommand.ID, AddEdgeCommand);
