import type { Point } from '$lib/geometry';
import { Node } from '$lib/automata/models/Node.svelte';
import { Edge } from '$lib/automata/models/Edge.svelte';
import type { FSAItem } from '$lib/automata/models/types';
import { SvelteMap } from 'svelte/reactivity';
import type { SerializedFSAGraph, Serializable } from '$lib/automata/serialisation';

/**
 * Overall representation of a finite state automaton (FSA) graph. It manages nodes and edges,
 * providing methods to add, update, and delete them.
 */
export class FSAGraph implements Serializable<SerializedFSAGraph> {
	private _title = $state<string | null>();
	readonly nodesMap = new SvelteMap<string, Node>();
	readonly edgesMap = new SvelteMap<string, Edge>();
	startNode = $state<Node | null>(null);
	isEmpty: boolean = $derived(this.nodesMap.size === 0);

	/**
	 * Adds a new node to the FSA at the specified position.
	 * If this is the first node being added, it is set as the start node.
	 * @param pos The position where the new node will be placed.
	 * @returns The newly created node.
	 */
	addNode(pos: Point): Node {
		const label = `q${this.nodesMap.size}`;
		const newNode = new Node(pos, label);
		if (this.nodesMap.size === 0) {
			this.startNode = newNode;
		}
		this.nodesMap.set(newNode.id, newNode);
		return newNode;
	}

	/**
	 * Adds a new edge between two nodes in the FSA.
	 * @param from The source node.
	 * @param to The target node.
	 * @returns The newly created edge.
	 */
	addEdge(from: Node, to: Node): Edge {
		const newEdge = new Edge(from, to);
		this.edgesMap.set(newEdge.id, newEdge);
		return newEdge;
	}

	/**
	 * Checks if an edge already exists between two nodes.
	 * @param from The source node.
	 * @param to The target node.
	 * @returns True if the edge exists, false otherwise.
	 */
	edgeAlreadyExists(from: Node, to: Node): boolean {
		const edgeId = Edge.createId(from, to);
		return this.edgesMap.has(edgeId);
	}

	/**
	 * Retrieves an item (node or edge) from the FSA graph by its ID, if it exists.
	 * @param id The ID of the item to retrieve.
	 * @returns The item if found, or null if not found.
	 */
	getItemFromId(id: string): FSAItem | null {
		const node = this.nodesMap.get(id);
		if (node) return node;

		const edge = this.edgesMap.get(id);
		if (edge) return edge;

		return null;
	}

	/**
	 * Deletes an item (node or edge) from the FSA graph, if it exists.
	 * @param item The item to delete.
	 */
	deleteItem(item: FSAItem): void {
		if (item instanceof Node) {
			this.deleteNode(item);
		} else if (item instanceof Edge) {
			this.edgesMap.delete(item.id);
		}
	}

	/**
	 * Deletes a node from the FSA graph, along with all associated edges.
	 * @param node The node to delete.
	 */
	deleteNode(node: Node): void {
		this.nodesMap.delete(node.id);
		// remove associated edges
		for (const edge of this.edgesMap.values()) {
			if (edge.from.id === node.id || edge.to.id === node.id) {
				this.edgesMap.delete(edge.id);
			}
		}
		// unset start node if needed
		if (this.startNode?.id === node.id) {
			this.startNode = null;
		}
	}

	/**
	 * Resets the FSA graph to an empty state.
	 */
	reset(): void {
		this._title = null;
		this.nodesMap.clear();
		this.edgesMap.clear();
		this.startNode = null;
	}

	get nodes(): Node[] {
		return Array.from(this.nodesMap.values());
	}

	get edges(): Edge[] {
		return Array.from(this.edgesMap.values());
	}

	get title(): string {
		return this._title ?? 'Untitled_FSA';
	}

	set title(newTitle: string) {
		this._title = newTitle;
	}

	toJSON(): SerializedFSAGraph {
		return {
			title: this.title,
			nodes: this.nodes.map((node) => node.toJSON()),
			edges: this.edges.map((edge) => edge.toJSON()),
			startNodeId: this.startNode ? this.startNode.id : null
		};
	}

	loadFromJSON(json: SerializedFSAGraph): void {
		this.title = json.title;
		this.nodesMap.clear();
		this.edgesMap.clear();
		json.nodes.forEach((nodeJson) => {
			const node = Node.fromJSON(nodeJson);
			this.nodesMap.set(node.id, node);
		});
		json.edges.forEach((edgeJson) => {
			const edge = Edge.fromJSON(edgeJson, this.nodesMap);
			this.edgesMap.set(edge.id, edge);
		});
		this.startNode = json.startNodeId ? (this.nodesMap.get(json.startNodeId) ?? null) : null;
	}
}
