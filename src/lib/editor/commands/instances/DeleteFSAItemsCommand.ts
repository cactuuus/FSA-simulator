import {
	Edge,
	FSAGraph,
	Node,
	type SerializedNode,
	type SerializedEdge
} from '$lib/automata-models';
import { Command } from '../base';
import { registerCommand } from '../registry';

export interface DeleteFSAItemsData {
	startNodeId: { from: string | null; to: string | null };
	Nodes: Record<string, SerializedNode>;
	Edges: Record<string, SerializedEdge>;
}

export class DeleteFSAItemsCommand extends Command<DeleteFSAItemsData> {
	static ID = 'delete-fsa-item(s)-command';
	id = DeleteFSAItemsCommand.ID;
	data: DeleteFSAItemsData;
	private _toDelete: string[];
	private _isInitialized: boolean;

	constructor(...ids: string[]) {
		super();
		this.data = { startNodeId: { from: null, to: null }, Nodes: {}, Edges: {} };
		this._toDelete = ids;
		this._isInitialized = false;
	}

	/**
	 * Load initilized data into the command, used when creating the command from JSON.
	 * @param data Data to load into the command, must be already initialized.
	 */
	private loadData(data: DeleteFSAItemsData): void {
		this.data = data;
		this._isInitialized = true;
	}

	/**
	 * Initializes the command data by retrieving the nodes and edges to delete (including all edges connected to to-be-deleted nodes), and the start node id data (in case it gets deleted in the process).
	 * This is performed only on first execution, as it cannot be performed in the constructor.
	 * @param fsa FSA graph on which the command is executed, used to retrieve the edges and transitions data.
	 */
	private initializeData(fsa: FSAGraph): void {
		// grab the nodes and edges to delete
		for (const id of this._toDelete) {
			const item = fsa.requireItem(id);
			if (item instanceof Node) {
				this.data.Nodes[item.id] = item.toJSON();
			} else if (item instanceof Edge) {
				this.data.Edges[item.id] = item.toJSON();
			}
		}
		// grab additional edges connected to to-be-deleted nodes
		for (const node of Object.values(this.data.Nodes)) {
			for (const edge of fsa.edges) {
				if (edge.from.id === node.id || (edge.to.id === node.id && !this.data.Edges[edge.id])) {
					this.data.Edges[edge.id] = edge.toJSON();
				}
			}
		}
		// set initial and final start node ids (if present)
		if (fsa.startNode !== null) {
			this.data.startNodeId.from = fsa.startNode.id;
			if (this._toDelete.includes(this.data.startNodeId.from)) {
				this.data.startNodeId.to = null;
			} else {
				this.data.startNodeId.to = this.data.startNodeId.from;
			}
		}
		this._isInitialized = true;
	}

	execute(fsa: FSAGraph): void {
		if (!this._isInitialized) this.initializeData(fsa);
		// delete edges first, as they might be connected to nodes that will be deleted
		for (const edgeId of Object.keys(this.data.Edges)) {
			fsa.deleteEdge(edgeId);
		}
		for (const nodeId of Object.keys(this.data.Nodes)) {
			fsa.deleteNode(nodeId);
		}
		// update start node if it was deleted
		if (this.data.startNodeId.to !== null) {
			fsa.startNode = fsa.requireNode(this.data.startNodeId.to);
		} else {
			fsa.startNode = null;
		}
	}

	undo(fsa: FSAGraph): void {
		// restore nodes first, as edges might be connected to them
		for (const nodeJson of Object.values(this.data.Nodes)) {
			const restoredNode = Node.fromJSON(nodeJson);
			fsa.addNode(restoredNode);
		}
		for (const edgeJson of Object.values(this.data.Edges)) {
			const restoredEdge = Edge.fromJSON(edgeJson, fsa.nodesMap);
			fsa.addEdge(restoredEdge);
		}
		// restore start node if it was deleted
		if (this.data.startNodeId.from !== null) {
			fsa.startNode = fsa.requireNode(this.data.startNodeId.from);
		} else {
			fsa.startNode = null;
		}
	}

	static fromJSON(commandJson: { data: DeleteFSAItemsData }): DeleteFSAItemsCommand {
		const command = new DeleteFSAItemsCommand();
		command.loadData(commandJson.data);
		return command;
	}
}

registerCommand(DeleteFSAItemsCommand.ID, DeleteFSAItemsCommand);
