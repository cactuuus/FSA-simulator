import { FSAGraph } from '$lib/automata/models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface ToggleEdgeStraightData {
	edgeId: string;
	toValue: boolean;
}

export class ToggleEdgeStraightCommand extends Command<ToggleEdgeStraightData> {
	static ID = 'toggle-edge-straight';
	id = ToggleEdgeStraightCommand.ID;
	data: ToggleEdgeStraightData;

	constructor(edgeId: string, toValue: boolean) {
		super();
		this.data = { edgeId, toValue };
	}

	execute(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.forceStraight = this.data.toValue;
	}

	undo(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.forceStraight = !this.data.toValue;
	}

	static fromJSON(commandJson: { data: ToggleEdgeStraightData }): ToggleEdgeStraightCommand {
		return new ToggleEdgeStraightCommand(commandJson.data.edgeId, commandJson.data.toValue);
	}
}

registerCommand(ToggleEdgeStraightCommand.ID, ToggleEdgeStraightCommand);
