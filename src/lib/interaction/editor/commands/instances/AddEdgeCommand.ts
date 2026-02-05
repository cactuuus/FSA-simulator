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

	constructor(sourceId: string, targetId: string) {
		super();
		this.data = { edgeId: Edge.createId(sourceId, targetId), sourceId, targetId };
	}

	execute(fsa: FSAGraph): void {
		const sourceNode = fsa.getNodeFromId(this.data.sourceId);
		const targetNode = fsa.getNodeFromId(this.data.targetId);
		if (!sourceNode || !targetNode) {
			throw new Error('[AddEdgeCommand] source or target node not found');
		} else if (fsa.getEdgeFromId(this.data.edgeId) !== null) {
			throw new Error(
				`[AddEdgeCommand] edge from ${this.data.sourceId} to ${this.data.targetId} already exists`
			);
		}
		fsa.addEdge(sourceNode, targetNode);
	}

	undo(fsa: FSAGraph): void {
		if (fsa.getEdgeFromId(this.data.edgeId) === null) {
			throw new Error(`[AddEdgeCommand] edge with id ${this.data.edgeId} does not exist.`);
		}
		fsa.deleteEdge(this.data.edgeId);
	}

	static fromJSON(commandJson: { data: AddEdgeData }): AddEdgeCommand {
		return new AddEdgeCommand(commandJson.data.sourceId, commandJson.data.targetId);
	}
}

registerCommand(AddEdgeCommand.ID, AddEdgeCommand);
