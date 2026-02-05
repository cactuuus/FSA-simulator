import type { Point } from '$lib/utils/geometry';
import { FSAGraph } from '$lib/automata/models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface AdjustEdgeShapeData {
	edgeId: string;
	initialControlPoint: Point;
	finalControlPoint: Point;
}

export class AdjustEdgeShapeCommand extends Command<AdjustEdgeShapeData> {
	static ID = 'adjust-edge-shape';
	id = AdjustEdgeShapeCommand.ID;
	data: AdjustEdgeShapeData;

	constructor(data: AdjustEdgeShapeData) {
		super();
		this.data = data;
	}

	execute(fsa: FSAGraph): void {
		const edge = fsa.getEdgeFromId(this.data.edgeId);
		if (!edge) {
			throw new Error(`[AdjustEdgeShapeCommand] edge with id ${this.data.edgeId} does not exist.`);
		}
		edge.updateControlPoint(this.data.finalControlPoint);
	}

	undo(fsa: FSAGraph): void {
		const edge = fsa.getEdgeFromId(this.data.edgeId);
		if (!edge) {
			throw new Error(`[AdjustEdgeShapeCommand] edge with id ${this.data.edgeId} does not exist.`);
		}
		edge.updateControlPoint(this.data.initialControlPoint);
	}

	static fromJSON(commandJson: { data: AdjustEdgeShapeData }): AdjustEdgeShapeCommand {
		return new AdjustEdgeShapeCommand(commandJson.data);
	}
}

registerCommand(AdjustEdgeShapeCommand.ID, AdjustEdgeShapeCommand);
