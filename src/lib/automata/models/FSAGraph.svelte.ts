import type { Point } from '$lib/geometry';
import { Node, Edge, type FSAItem } from '$lib/automata/models';
import { SvelteMap } from 'svelte/reactivity';
import type { SerializedFSAGraph, Serializable } from '$lib/automata/serialisation';

/**
 * Overall representation of a finite state automaton (FSA) graph. It manages nodes and edges,
 * providing methods to add, update, and delete them.
 */
export class FSAGraph implements Serializable<SerializedFSAGraph> {
	readonly nodesMap = new SvelteMap<string, Node>();
	readonly edgesMap = new SvelteMap<string, Edge>();
	startNode = $state<Node | null>(null);

	addNode(pos: Point): Node {
		const label = `q${this.nodesMap.size}`;
		const newNode = new Node(pos, label);
		if (this.nodesMap.size === 0) {
			this.startNode = newNode;
		}
		this.nodesMap.set(newNode.id, newNode);
		return newNode;
	}

	addEdge(from: Node, to: Node): Edge {
		const newEdge = new Edge(from, to);
		this.edgesMap.set(newEdge.id, newEdge);
		return newEdge;
	}

	edgeAlreadyExists(from: Node, to: Node): boolean {
		const edgeId = Edge.createId(from, to);
		return this.edgesMap.has(edgeId);
	}

	getItemFromId(id: string): FSAItem | null {
		const node = this.nodesMap.get(id);
		if (node) return node;

		const edge = this.edgesMap.get(id);
		if (edge) return edge;

		return null;
	}

	deleteItem(item: FSAItem): void {
		if (item instanceof Node) {
			this.deleteNode(item);
		} else if (item instanceof Edge) {
			this.edgesMap.delete(item.id);
		}
	}

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

	get nodes(): Node[] {
		return Array.from(this.nodesMap.values());
	}

	get edges(): Edge[] {
		return Array.from(this.edgesMap.values());
	}

	toJSON(): SerializedFSAGraph {
		return {
			nodes: this.nodes.map((node) => node.toJSON()),
			edges: this.edges.map((edge) => edge.toJSON()),
			startNodeId: this.startNode ? this.startNode.id : null
		};
	}
}
