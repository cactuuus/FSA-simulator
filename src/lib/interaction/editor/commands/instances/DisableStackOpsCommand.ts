import { FSAGraph } from '$lib/automata/models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface DisableStackOpsData {
	transitionStackOps: Record<string, { pop: string; push: string }>;
}

export class DisableStackOpsCommand extends Command<DisableStackOpsData> {
	static ID = 'disable-stack-ops';
	id = DisableStackOpsCommand.ID;
	data: DisableStackOpsData;
	private _isInitialized: boolean;

	constructor() {
		super();
		this.data = {
			transitionStackOps: {}
		};
		this._isInitialized = false;
	}

	/**
	 * Load initilized data into the command, used when creating the command from JSON.
	 * @param data Data to load into the command, must be already initialized.
	 */
	private loadData(data: DisableStackOpsData) {
		this.data = data;
		this._isInitialized = true;
	}

	/**
	 * Initializes the command data by storing the current stack operations of all transitions in the FSA.
	 * The command assumes that the FSA's stack operations are currently enabled, so pop and push values are expected to be present on the transitions.
	 * @param fsa The FSA graph from which to extract the current stack operations of the transitions.
	 */
	private initializeData(fsa: FSAGraph) {
		this._isInitialized = true;
		fsa.transitions.forEach((transition) => {
			this.data.transitionStackOps[transition.id] = {
				pop: transition.popRawValue!,
				push: transition.pushRawValue!
			};
		});
	}

	execute(fsa: FSAGraph): void {
		if (!this._isInitialized) this.initializeData(fsa);
		fsa.hasStackOps = false;
	}

	undo(fsa: FSAGraph): void {
		fsa.hasStackOps = true;
		fsa.transitions.forEach((transition) => {
			const previousOps = this.data.transitionStackOps[transition.id];
			transition.popRawValue = previousOps.push;
			transition.pushRawValue = previousOps.pop;
		});
	}

	static fromJSON(commandJson: { data: DisableStackOpsData }): DisableStackOpsCommand {
		const command = new DisableStackOpsCommand();
		command.loadData(commandJson.data);
		return command;
	}
}

registerCommand(DisableStackOpsCommand.ID, DisableStackOpsCommand);
