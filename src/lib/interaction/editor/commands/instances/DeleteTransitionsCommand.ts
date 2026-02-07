import {
	FSAGraph,
	Transition,
	Edge,
	type SerializedTransition,
	type SerializedEdge
} from '$lib/automata/models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface DeleteTransitionsData {
	groupedTransitions: Record<string, SerializedTransition[]>;
	deletedEdges: Record<string, SerializedEdge>;
}

export class DeleteTransitionsCommand extends Command<DeleteTransitionsData> {
	static ID = 'delete-transition(s)-command';
	id = DeleteTransitionsCommand.ID;
	data: DeleteTransitionsData;
	private _toDelete: Set<string>;
	private _isInitialized = false;

	constructor(...transitionIds: string[]) {
		super();
		this._toDelete = new Set(transitionIds);
		this.data = { groupedTransitions: {}, deletedEdges: {} };
	}

	/**
	 * Load initilized data into the command, used when creating the command from JSON.
	 * @param data Data to load into the command, must be already initialized.
	 */
	private loadData(data: DeleteTransitionsData): void {
		this.data = data;
		this._isInitialized = true;
	}

	/**
	 * Initializes the command data by grouping the transitions to delete by their edge, and determining which edges will be completely deleted as a consequence.
	 * This is performed only on first execution, as it cannot be performed in the constructor.
	 * @param fsa FSA graph on which the command is executed, used to retrieve the edges and transitions data.
	 */
	private initializeData(fsa: FSAGraph): void {
		for (const edge of fsa.edges) {
			const toDeleteInEdge = edge.transitions.filter((t) => this._toDelete.has(t.id));
			if (toDeleteInEdge.length > 0) {
				this.data.groupedTransitions[edge.id] = toDeleteInEdge.map((t) => t.toJSON());
				if (toDeleteInEdge.length === edge.transitions.length) {
					const edgeJson = edge.toJSON();
					edgeJson.transitions = []; // Empty transitions, we only want edge data
					this.data.deletedEdges[edge.id] = edgeJson;
				}
			}
			toDeleteInEdge.forEach((t) => this._toDelete.delete(t.id));
		}
		this._isInitialized = true;
	}

	execute(fsa: FSAGraph): void {
		if (!this._isInitialized) this.initializeData(fsa);
		for (const [edgeId, transitionsJson] of Object.entries(this.data.groupedTransitions)) {
			const edge = fsa.requireEdge(edgeId);
			if (this.data.deletedEdges[edgeId]) {
				fsa.deleteEdge(edgeId);
			} else {
				const transitionIds = transitionsJson.map((t) => t.id);
				edge.deleteTransitions(...transitionIds);
			}
		}
	}

	undo(fsa: FSAGraph): void {
		for (const [edgeId, transitionsJson] of Object.entries(this.data.groupedTransitions)) {
			if (this.data.deletedEdges[edgeId]) {
				const restoredEdge = Edge.fromJSON(this.data.deletedEdges[edgeId]!, fsa.nodesMap);
				fsa.addEdge(restoredEdge);
			}
			const edge = fsa.requireEdge(edgeId);
			const transitions = transitionsJson.map((t) => Transition.fromJSON(t));
			edge.addTransitions(...transitions);
		}
	}

	static fromJSON(commandJson: { data: DeleteTransitionsData }): DeleteTransitionsCommand {
		const command = new DeleteTransitionsCommand();
		command.loadData(commandJson.data);
		return command;
	}
}

registerCommand(DeleteTransitionsCommand.ID, DeleteTransitionsCommand);
