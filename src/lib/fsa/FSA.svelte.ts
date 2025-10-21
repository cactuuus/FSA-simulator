import { type Point, Node, Edge, DraftEdge } from '$lib/fsa';
export class FSA {
	readonly nodes = $state<Node[]>([]);
	readonly edges = $state<Edge[]>([]);
	draftEdge = $state<DraftEdge | null>(null);

	addNode(pos: Point): void {
		const label = `q${this.nodes.length}`;
		const isStart = this.nodes.length === 0;
		this.nodes.push(new Node(pos, label, isStart));
	}

	addEdge(from: Node, to: Node): void {
		this.edges.push(new Edge(from, to));
	}

	getNodeAt(point: Point): Node | null {
		return this.nodes.find((node) => node.contains(point)) ?? null;
	}

	updateNodePosition(node: Node, newPoint: Point): void {
		node.pos.x = newPoint.x;
		node.pos.y = newPoint.y;
	}

	setDraftEdge(from: Node, to: Point | null): void {
		if (!from || !to) {
			this.draftEdge = null;
		} else {
			this.draftEdge = new DraftEdge(from, to);
		}
	}

	clearDraftEdge(): void {
		this.draftEdge = null;
	}
}
