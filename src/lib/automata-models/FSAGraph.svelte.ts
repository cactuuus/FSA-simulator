import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type { Point } from '$lib/utils/geometry';
import type { Serializable } from '$lib/utils/serialization';
import type { FSAItem } from './types';
import { Node, type SerializedNode } from './Node.svelte';
import { Edge, type SerializedEdge } from './Edge.svelte';
import { Transition } from './Transition.svelte';

/**
 * Serialized representation of an entire FSA graph.
 */
export interface SerializedFSAGraph {
	title: string;
	hasStackOps: boolean;
	nodes: SerializedNode[];
	edges: SerializedEdge[];
	startNodeId: string | null;
}

/**
 * Types of finite state automata.
 */
export enum FSAType {
	DFA = 'DFA',
	NFA = 'NFA',
	PDA = 'PDA',
	DPDA = 'DPDA'
}

/**
 * Overall representation of a finite state automaton (FSA) graph. It manages nodes and edges,
 * providing methods to add, update, and delete them.
 */
export class FSAGraph implements Serializable<SerializedFSAGraph> {
	private _title = $state<string | null>();
	private _hasStackOps = $state<boolean>(false);
	readonly nodesMap = new SvelteMap<string, Node>();
	readonly edgesMap = new SvelteMap<string, Edge>();
	startNode = $state<Node | null>(null);
	nodes: Node[] = $derived(Array.from(this.nodesMap.values()));
	edges: Edge[] = $derived(Array.from(this.edgesMap.values()));
	transitions: Transition[] = $derived(this.edges.flatMap((edge) => edge.transitions));
	isEmpty: boolean = $derived(this.nodesMap.size === 0);
	hasStart: boolean = $derived(this.startNode !== null);
	hasAcceptingNodes: boolean = $derived(this.nodes.some((node) => node.isAccepting));
	isDeterministic: boolean = $derived(this._isDeterministic());
	type: FSAType = $derived.by(() => {
		if (this.hasStackOps) return this.isDeterministic ? FSAType.DPDA : FSAType.PDA;
		return this.isDeterministic ? FSAType.DFA : FSAType.NFA;
	});
	adjacencyMap: Map<Node, [Transition, Node][]> = $derived.by(() => {
		const adjMap: Map<Node, [Transition, Node][]> = new SvelteMap(
			this.nodes.map((node) => [node, []])
		);
		this.edges.forEach((edge) => {
			edge.transitions.forEach((transition) => {
				adjMap.get(edge.from)?.push([transition, edge.to]);
			});
		});
		return adjMap;
	});

	/**
	 * Adds a new node to the FSA at the specified position.
	 * If this is the first node being added, it is set as the start node.
	 * @param pos The position where the new node will be placed.
	 * @param id The unique ID for the new node.
	 * @returns The newly created node.
	 */
	createNewNode(pos: Point, id: string): Node {
		if (this.nodesMap.has(id)) {
			throw new Error(`Node with id ${id} already exists in FSA graph.`);
		}
		const label = `q${this.nodesMap.size}`;
		const newNode = new Node(pos, label, false, id);
		if (this.nodesMap.size === 0) {
			this.startNode = newNode;
		}
		this.nodesMap.set(newNode.id, newNode);
		return newNode;
	}

	/**
	 * Adds an existing node to the FSA graph. The node's ID must be unique within the graph.
	 * @param node
	 */
	addNode(node: Node): void {
		if (this.nodesMap.has(node.id)) {
			throw new Error(`Node with id ${node.id} already exists in FSA graph.`);
		}
		this.nodesMap.set(node.id, node);
	}

	/**
	 * Adds a new edge between two nodes in the FSA.
	 * @param from The source node.
	 * @param to The target node.
	 * @returns The newly created edge.
	 */
	createNewEdge(from: Node, to: Node, id?: string): Edge {
		if (!this.nodesMap.has(from.id)) {
			throw new Error(`Source node with id ${from.id} does not exist in FSA graph.`);
		}
		if (!this.nodesMap.has(to.id)) {
			throw new Error(`Target node with id ${to.id} does not exist in FSA graph.`);
		}
		if (this.edgeAlreadyExists(from, to)) {
			throw new Error(`Edge from ${from.id} to ${to.id} already exists in FSA graph.`);
		}
		const newEdge = new Edge(from, to, id);
		this.edgesMap.set(newEdge.id, newEdge);
		return newEdge;
	}

	/**
	 * Adds an existing edge to the FSA graph. The edge's source and target nodes must already exist in the graph, and the edge itself must not already exist.
	 * @param edge
	 */
	addEdge(edge: Edge): void {
		if (!this.nodesMap.has(edge.from.id)) {
			throw new Error(`Source node with id ${edge.from.id} does not exist in FSA graph.`);
		}
		if (!this.nodesMap.has(edge.to.id)) {
			throw new Error(`Target node with id ${edge.to.id} does not exist in FSA graph.`);
		}
		if (this.edgeAlreadyExists(edge.from, edge.to)) {
			throw new Error(`Edge from ${edge.from.id} to ${edge.to.id} already exists in FSA graph.`);
		}
		this.edgesMap.set(edge.id, edge);
	}

	/**
	 * Checks if an edge already exists between two nodes.
	 * @param from The source node.
	 * @param to The target node.
	 * @returns True if the edge exists, false otherwise.
	 */
	edgeAlreadyExists(from: Node, to: Node): boolean {
		const edgeId = Edge.createId(from.id, to.id);
		return this.edgesMap.has(edgeId);
	}

	/**
	 * Retrieves an item (node or edge) from the FSA graph by its ID, if it exists.
	 * @param id The ID of the item to retrieve.
	 * @returns The item if found, or null if not found.
	 */
	getItem(id: string): FSAItem | null {
		const node = this.getNode(id);
		if (node) return node;
		const edge = this.getEdge(id);
		if (edge) return edge;
		return null;
	}

	/**
	 * Retrieves a node from the FSA graph by its ID, if it exists.
	 * @param id The ID of the node to retrieve.
	 * @returns The node if found, or null if not found.
	 */
	getNode(id: string): Node | null {
		return this.nodesMap.get(id) ?? null;
	}

	/**
	 * Retrieves an edge from the FSA graph by its ID, if it exists.
	 * @param id The ID of the edge to retrieve.
	 * @returns The edge if found, or null if not found.
	 */
	getEdge(id: string): Edge | null {
		return this.edgesMap.get(id) ?? null;
	}

	/**
	 * Retrieves an item (node or edge) from the FSA graph by its ID, throwing an error if it does not exist.
	 * @param id The ID of the item to retrieve.
	 * @returns The item matching the ID.
	 */
	requireItem(id: string): FSAItem {
		const item = this.getItem(id);
		if (!item) {
			throw new Error(`Item with id ${id} does not exist in FSA graph.`);
		}
		return item;
	}

	/**
	 * Retrieves a node from the FSA graph by its ID, throwing an error if it does not exist.
	 * @param id The ID of the node to retrieve.
	 * @returns The node matching the ID.
	 */
	requireNode(id: string): Node {
		const node = this.getNode(id);
		if (!node) {
			throw new Error(`Node with id ${id} does not exist in FSA graph.`);
		}
		return node;
	}

	/**
	 * Retrieves an edge from the FSA graph by its ID, throwing an error if it does not exist.
	 * @param id The ID of the edge to retrieve.
	 * @returns The edge matching the ID.
	 */
	requireEdge(id: string): Edge {
		const edge = this.getEdge(id);
		if (!edge) {
			throw new Error(`Edge with id ${id} does not exist in FSA graph.`);
		}
		return edge;
	}

	/**
	 * Retrieves a transition from the FSA graph by its ID, throwing an error if it does not exist.
	 * @param id The ID of the transition to retrieve.
	 * @returns The transition matching the ID.
	 */
	requireTransition(id: string): Transition {
		const transition = this.transitions.find((t) => t.id === id);
		if (!transition) {
			throw new Error(`Transition with id ${id} does not exist in FSA graph.`);
		}
		return transition;
	}

	/**
	 * Deletes an item (node or edge) from the FSA graph, if it exists.
	 * @param id The IDs of the items to delete.
	 */
	deleteItems(...ids: string[]): void {
		ids.forEach((id) => {
			if (this.nodesMap.has(id)) {
				this.deleteNode(id);
				return;
			}
			if (this.edgesMap.has(id)) {
				this.deleteEdge(id);
				return;
			}
			throw new Error(`Item with id ${id} does not exist in FSA graph.`);
		});
	}

	/**
	 * Deletes a node from the FSA graph, along with all associated edges.
	 * @param nodeId The ID of the node to delete.
	 */
	deleteNode(nodeId: string): void {
		if (!this.nodesMap.has(nodeId)) {
			throw new Error(`Node with id ${nodeId} does not exist in FSA graph.`);
		}
		this.nodesMap.delete(nodeId);
		// remove associated edges
		const edgesToDelete = this.edges
			.filter((edge) => edge.from.id === nodeId || edge.to.id === nodeId)
			.map((edge) => edge.id);
		edgesToDelete.forEach((edgeId) => this.edgesMap.delete(edgeId));
		// unset start node if needed
		if (this.startNode?.id === nodeId) {
			this.startNode = null;
		}
	}

	/**
	 * Deletes an edge from the FSA graph by its ID.
	 * @param edgeId The ID of the edge to delete.
	 */
	deleteEdge(edgeId: string): void {
		if (!this.edgesMap.has(edgeId)) {
			throw new Error(`Edge with id ${edgeId} does not exist in FSA graph.`);
		}
		this.edgesMap.delete(edgeId);
	}

	/**
	 * Resets the FSA graph to an empty state.
	 */
	reset(): void {
		this._title = null;
		this._hasStackOps = false;
		this.nodesMap.clear();
		this.edgesMap.clear();
		this.startNode = null;
	}

	/**
	 * Checks if the FSA is deterministic.
	 * @returns True if the FSA is deterministic, false otherwise.
	 */
	private _isDeterministic(): boolean {
		for (const [, transitions] of this.adjacencyMap) {
			for (let i = 0; i < transitions.length; i++) {
				const t1 = transitions[i][0];
				// for non-PDA only, also check for simple epsilon transitions
				if (!this.hasStackOps && t1.consume === Transition.EPSILON) return false;
				for (let j = i + 1; j < transitions.length; j++) {
					const t2 = transitions[j][0];
					const consumeConflict =
						t1.consume === t2.consume ||
						t1.consume === Transition.EPSILON ||
						t2.consume === Transition.EPSILON;
					if (!this.hasStackOps && consumeConflict) return false;

					const popConflict =
						t1.pop === t2.pop || t1.pop === Transition.EPSILON || t2.pop === Transition.EPSILON;
					if (consumeConflict && popConflict) return false;
				}
			}
		}
		return true;
	}

	/**
	 * Generates the alphabet of input symbols used in the FSA transitions.
	 * @param includeEpsilon Whether to include the epsilon symbol in the alphabet (false by default).
	 * @returns The set of input symbols in the FSA alphabet.
	 */
	alphabet(includeEpsilon: boolean = false): Set<string> {
		const alphabet = new SvelteSet<string>(this.transitions.map((t) => t.consume));
		if (!includeEpsilon) alphabet.delete(Transition.EPSILON);
		return alphabet;
	}

	/**
	 * Generates the alphabet of stack symbols used in the FSA transitions. Only applicable for PDAs, will return an empty set by default for non-PDAs.
	 * @param includeEpsilon Whether to include the epsilon symbol in the stack alphabet (false by default).
	 * @returns The set of stack symbols in the FSA stack alphabet.
	 */
	stackAlphabet(includeEpsilon: boolean = false): Set<string> {
		if (!this.hasStackOps) return new SvelteSet<string>();
		const stackAlphabet = new SvelteSet<string>(this.transitions.map((t) => t.pop!));
		if (!includeEpsilon) stackAlphabet.delete(Transition.EPSILON);
		return stackAlphabet;
	}

	get hasStackOps(): boolean {
		return this._hasStackOps;
	}

	/**
	 * Toggle stack operations for the FSA graph, effectively switching between PDA and non-PDA.
	 * Note: When switching from PDA to non-PDA, all stack operations in transition symbols will be lost.
	 * @param value True to enable stack operations, false to disable.
	 */
	set hasStackOps(value: boolean) {
		this.transitions.forEach((transition) => {
			transition.toggleStackOps(value);
		});
		this._hasStackOps = value;
	}

	get title(): string {
		return this._title ?? 'Untitled_FSA';
	}

	set title(newTitle: string) {
		this._title = newTitle.trim();
	}

	toJSON(): SerializedFSAGraph {
		return {
			title: this.title,
			hasStackOps: this.hasStackOps,
			nodes: this.nodes.map((node) => node.toJSON()),
			edges: this.edges.map((edge) => edge.toJSON()),
			startNodeId: this.startNode ? this.startNode.id : null
		};
	}

	loadFromJSON(json: SerializedFSAGraph): void {
		this.title = json.title;
		this.hasStackOps = json.hasStackOps ?? false;
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
