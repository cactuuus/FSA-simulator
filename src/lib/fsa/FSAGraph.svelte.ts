import { type Point, Node, Edge, type FSAItem } from '$lib/fsa';
export class FSAGraph {
	readonly nodes = $state<Node[]>([]);
	readonly edges = $state<Edge[]>([]);

	addNode(pos: Point): Node {
		const label = `q${this.nodes.length}`;
		const isStart = this.nodes.length === 0;
		const newNode = new Node(pos, label, isStart);
		this.nodes.push(newNode);
		return newNode;
	}

	addEdge(from: Node, to: Node): Edge {
		const newEdge = new Edge(from, to);
		this.edges.push(newEdge);
		return newEdge;
	}

	edgeAlreadyExists(from: Node, to: Node): boolean {
		return this.edges.some((e) => e.from.id === from.id && e.to.id === to.id);
	}

	updateNodePosition(node: Node, newPoint: Point): void {
		node.pos.x = newPoint.x;
		node.pos.y = newPoint.y;
	}

	getItemFromId(id: string): FSAItem | null {
		const node = this.nodes.find((n) => n.id === id);
		if (node) return node;

		const edge = this.edges.find((e) => e.id === id);
		if (edge) return edge;

		return null;
	}
}
