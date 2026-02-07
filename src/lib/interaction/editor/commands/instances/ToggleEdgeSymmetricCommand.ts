import { FSAGraph } from '$lib/automata/models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface ToggleEdgeSymmetricData {
	edgeId: string;
	toValue: boolean;
}

export class ToggleEdgeSymmetricCommand extends Command<ToggleEdgeSymmetricData> {
	static ID = 'toggle-edge-symmetric';
	id = ToggleEdgeSymmetricCommand.ID;
	data: ToggleEdgeSymmetricData;

	constructor(edgeId: string, toValue: boolean) {
		super();
		this.data = { edgeId, toValue };
	}
	execute(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.isSymmetric = this.data.toValue;
	}

	undo(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.isSymmetric = !this.data.toValue;
	}

	static fromJSON(commandJson: { data: ToggleEdgeSymmetricData }): ToggleEdgeSymmetricCommand {
		return new ToggleEdgeSymmetricCommand(commandJson.data.edgeId, commandJson.data.toValue);
	}
}

registerCommand(ToggleEdgeSymmetricCommand.ID, ToggleEdgeSymmetricCommand);
