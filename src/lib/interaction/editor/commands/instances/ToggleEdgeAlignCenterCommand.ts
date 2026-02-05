import { FSAGraph } from '$lib/automata/models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface ToggleEdgeAlignCenterData {
	edgeId: string;
	toValue: boolean;
}

export class ToggleEdgeAlignCenterCommand extends Command<ToggleEdgeAlignCenterData> {
	static ID = 'toggle-edge-align-center';
	id = ToggleEdgeAlignCenterCommand.ID;
	data: ToggleEdgeAlignCenterData;

	constructor(edgeId: string, toValue: boolean) {
		super();
		this.data = { edgeId, toValue };
	}
	execute(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.forceAlignCenter = this.data.toValue;
	}

	undo(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.forceAlignCenter = !this.data.toValue;
	}

	static fromJSON(commandJson: { data: ToggleEdgeAlignCenterData }): ToggleEdgeAlignCenterCommand {
		return new ToggleEdgeAlignCenterCommand(commandJson.data.edgeId, commandJson.data.toValue);
	}
}

registerCommand(ToggleEdgeAlignCenterCommand.ID, ToggleEdgeAlignCenterCommand);
