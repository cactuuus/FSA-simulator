import type { Point } from '$lib/geometry';
import { Node, type SerializedNode } from '$lib/automata/models/Node.svelte';
import { Edge, type SerializedEdge } from '$lib/automata/models/Edge.svelte';
import { TransitionSymbol } from './TransitionSymbol.svelte';
import type { FSAItem } from '$lib/automata/models/types';
import { SvelteMap } from 'svelte/reactivity';
import type { Serializable } from '$lib/utils/serialization';

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
	isEmpty: boolean = $derived(this.nodesMap.size === 0);

	nodes = $derived(Array.from(this.nodesMap.values()));
	edges = $derived(Array.from(this.edgesMap.values()));
	edgesBySource = $derived.by<Map<string, Edge[]>>(() => {
		const edgesBySource: Map<string, Edge[]> = new SvelteMap();
		for (const edge of this.edges) {
			if (!edgesBySource.has(edge.from.id)) {
				edgesBySource.set(edge.from.id, []);
			}
			edgesBySource.get(edge.from.id)!.push(edge);
		}
		return edgesBySource;
	});
	type = $derived.by(() => {
		if (this.hasStackOps) return this.isDeterministic() ? FSAType.DPDA : FSAType.PDA;
		return this.isDeterministic() ? FSAType.DFA : FSAType.NFA;
	});

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
		newEdge.addTransition(this.hasStackOps);
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
		this._hasStackOps = false;
		this.nodesMap.clear();
		this.edgesMap.clear();
		this.startNode = null;
	}

	/**
	 * Checks if the FSA is deterministic.
	 * @returns True if the FSA is deterministic, false otherwise.
	 */
	isDeterministic(): boolean {
		for (const node of this.nodes) {
			const outgoingEdges = this.edgesBySource.get(node.id) ?? [];
			const transitions = outgoingEdges.flatMap((edge: Edge) => edge.transitionSymbols) ?? [];

			for (let i = 0; i < transitions.length; i++) {
				const t1 = transitions[i];
				// for non-PDA only, also check for simple epsilon transitions
				if (!this.hasStackOps && transitions[i].consume === TransitionSymbol.EPSILON) return false;
				for (let j = i + 1; j < transitions.length; j++) {
					const t2 = transitions[j];
					const consumeConflict =
						t1.consume === t2.consume ||
						t1.consume === TransitionSymbol.EPSILON ||
						t2.consume === TransitionSymbol.EPSILON;
					if (!this.hasStackOps && consumeConflict) return false;

					const popConflict =
						t1.pop === t2.pop ||
						t1.pop === TransitionSymbol.EPSILON ||
						t2.pop === TransitionSymbol.EPSILON;
					if (consumeConflict && popConflict) return false;
				}
			}
		}
		return true;
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
		this.edges.forEach((edge: Edge) => {
			edge.transitionSymbols.forEach((transition: TransitionSymbol) => {
				transition.toggleStackOps(value);
			});
		});
		this._hasStackOps = value;
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
