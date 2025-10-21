import type { Node, Edge, GraphData, Point, ActiveEdge } from '$lib/types';

export class FSA {
	private _graph = $state<GraphData>({
		nodes: [],
		edges: []
	});

	draftEdge = $state<ActiveEdge | null>(null);
	selectedNode = $state<Node | null>(null);
	selectedEdge = $state<Edge | null>(null);

	get graph(): GraphData {
		return this._graph;
	}

	addNode(pos: Point): void {
		const newNode = {
			id: `node-${self.crypto.randomUUID()}`,
			pos: pos,
			label: `q${this._graph.nodes.length}`,
			isStart: this._graph.nodes.length === 0,
			isAccepting: false
		};
		this._graph.nodes.push(newNode);
	}

	addEdge(from: Node, to: Node): void {
		const newEdge: Edge = {
			id: `edge-${self.crypto.randomUUID()}`,
			from,
			to,
			label: ''
		};
		this._graph.edges.push(newEdge);
	}

	getNodeAt(pos: Point): Node | null {
		const node = this.graph.nodes.find((node) => {
			const dx = node.pos.x - pos.x;
			const dy = node.pos.y - pos.y;
			return Math.sqrt(dx * dx + dy * dy) < 30;
		});
		return node ?? null;
	}

	selectNode(node: Node): void {
		this.selectedNode = node;
	}

	unselectNode(): void {
		this.selectedNode = null;
	}

	updateNodePosition(node: Node, newPoint: Point): void {
		node.pos.x = newPoint.x;
		node.pos.y = newPoint.y;
	}

	setDraftEdge(from: Node, toPoint: Point | null): void {
		if (!from || !toPoint) {
			this.draftEdge = null;
		} else {
			this.draftEdge = { from, toPoint };
		}
	}

	clearDraftEdge(): void {
		this.draftEdge = null;
	}
}
