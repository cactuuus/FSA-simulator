import { FSAGraph, type SerializedFSAGraph } from '$lib/automata-models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface LoadGraphData {
	from: SerializedFSAGraph;
	to: SerializedFSAGraph;
}

export class LoadGraphCommand extends Command<LoadGraphData> {
	static ID = 'load-graph-command';
	id = LoadGraphCommand.ID;
	data: LoadGraphData;
	private _isInitialized: boolean;

	constructor(to: FSAGraph | SerializedFSAGraph) {
		super();
		const toFsaData = to instanceof FSAGraph ? to.toJSON() : to;
		this.data = { from: toFsaData, to: toFsaData }; // from is a placeholder, will be set on first execution
		this._isInitialized = false;
	}

	private initializeFromData(fromFsa: FSAGraph | SerializedFSAGraph): void {
		this.data.from = fromFsa instanceof FSAGraph ? fromFsa.toJSON() : fromFsa;
		this._isInitialized = true;
	}

	execute(fsa: FSAGraph): void {
		if (!this._isInitialized) this.initializeFromData(fsa);
		fsa.loadFromJSON(this.data.to);
	}

	undo(fsa: FSAGraph): void {
		fsa.loadFromJSON(this.data.from);
	}

	static fromJSON(commandJson: { data: LoadGraphData }): LoadGraphCommand {
		const command = new LoadGraphCommand(commandJson.data.to);
		command.initializeFromData(commandJson.data.from);
		return command;
	}
}

registerCommand(LoadGraphCommand.ID, LoadGraphCommand);
