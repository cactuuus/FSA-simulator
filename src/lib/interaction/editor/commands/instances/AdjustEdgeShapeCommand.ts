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

	constructor(edgeId: string, initialControlPoint: Point, finalControlPoint: Point) {
		super();
		this.data = { edgeId, initialControlPoint, finalControlPoint };
	}

	execute(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.updateControlPoint(this.data.finalControlPoint);
	}

	undo(fsa: FSAGraph): void {
		const edge = fsa.requireEdge(this.data.edgeId);
		edge.updateControlPoint(this.data.initialControlPoint);
	}

	static fromJSON(commandJson: { data: AdjustEdgeShapeData }): AdjustEdgeShapeCommand {
		return new AdjustEdgeShapeCommand(
			commandJson.data.edgeId,
			commandJson.data.initialControlPoint,
			commandJson.data.finalControlPoint
		);
	}
}

registerCommand(AdjustEdgeShapeCommand.ID, AdjustEdgeShapeCommand);
