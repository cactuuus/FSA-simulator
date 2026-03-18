import { Edge, FSAGraph, Transition } from '$lib/automata-models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface AddEdgeData {
	edgeId: string;
	sourceId: string;
	targetId: string;
	defaultTransitionId: string;
}

export class AddEdgeCommand extends Command<AddEdgeData> {
	static ID = 'add-edge';
	id = AddEdgeCommand.ID;
	data: AddEdgeData;

	constructor(sourceId: string, targetId: string, edgeId?: string, defaultTransitionId?: string) {
		super();
		this.data = {
			edgeId: edgeId ?? Edge.createId(sourceId, targetId),
			sourceId,
			targetId,
			defaultTransitionId: defaultTransitionId ?? Transition.createId()
		};
	}

	execute(fsa: FSAGraph): void {
		const sourceNode = fsa.requireNode(this.data.sourceId);
		const targetNode = fsa.requireNode(this.data.targetId);
		const edge = fsa.createNewEdge(sourceNode, targetNode, this.data.edgeId);
		edge.addTransitions(Transition.createEmpty(fsa.hasStackOps, this.data.defaultTransitionId));
	}

	undo(fsa: FSAGraph): void {
		fsa.deleteEdge(this.data.edgeId);
	}

	static fromJSON(commandJson: { data: AddEdgeData }): AddEdgeCommand {
		return new AddEdgeCommand(
			commandJson.data.sourceId,
			commandJson.data.targetId,
			commandJson.data.edgeId,
			commandJson.data.defaultTransitionId
		);
	}
}

registerCommand(AddEdgeCommand.ID, AddEdgeCommand);
