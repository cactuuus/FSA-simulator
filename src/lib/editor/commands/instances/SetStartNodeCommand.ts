import { FSAGraph } from '$lib/automata-models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface SetStartNodeData {
	from: string | null;
	to: string | null;
}

export class SetStartNodeCommand extends Command<SetStartNodeData> {
	static ID = 'set-start-node-command';
	id = SetStartNodeCommand.ID;
	data: SetStartNodeData;
	private _isInitialized: boolean;

	constructor(to: string | null) {
		super();
		this.data = { from: null, to };
		this._isInitialized = false;
	}

	loadData(from: string | null): void {
		this.data.from = from;
		this._isInitialized = true;
	}

	initializeData(fsa: FSAGraph): void {
		this.data.from = fsa.startNode?.id ?? null;
		this._isInitialized = true;
	}

	execute(fsa: FSAGraph): void {
		if (!this._isInitialized) this.initializeData(fsa);
		fsa.startNode = this.data.to ? fsa.requireNode(this.data.to) : null;
	}

	undo(fsa: FSAGraph): void {
		fsa.startNode = this.data.from ? fsa.requireNode(this.data.from) : null;
	}

	static fromJSON(commandJson: { data: SetStartNodeData }): SetStartNodeCommand {
		const command = new SetStartNodeCommand(commandJson.data.to);
		command.loadData(commandJson.data.from);
		return command;
	}
}

registerCommand(SetStartNodeCommand.ID, SetStartNodeCommand);
