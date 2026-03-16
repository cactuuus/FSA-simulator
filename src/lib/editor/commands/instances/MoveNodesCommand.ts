import type { Point } from '$lib/utils/geometry';
import { FSAGraph } from '$lib/automata-models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface MoveNodesData {
	nodeIds: string[];
	offset: Point;
}

export class MoveNodesCommand extends Command<MoveNodesData> {
	static ID = 'move-node(s)';
	id = MoveNodesCommand.ID;
	data: MoveNodesData;

	constructor(offset: Point, ...nodeIds: string[]) {
		super();
		this.data = { nodeIds, offset };
	}

	execute(fsa: FSAGraph): void {
		for (const nodeId of this.data.nodeIds) {
			const node = fsa.requireNode(nodeId);
			node.moveBy(this.data.offset);
		}
	}

	undo(fsa: FSAGraph): void {
		const invetedOffset = { x: -this.data.offset.x, y: -this.data.offset.y };
		for (const nodeId of this.data.nodeIds) {
			const node = fsa.requireNode(nodeId);
			node.moveBy(invetedOffset);
		}
	}

	static fromJSON(commandJson: { data: MoveNodesData }): MoveNodesCommand {
		return new MoveNodesCommand(commandJson.data.offset, ...commandJson.data.nodeIds);
	}
}

registerCommand(MoveNodesCommand.ID, MoveNodesCommand);
