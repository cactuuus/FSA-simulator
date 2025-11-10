import { Node, type Point, type FSAItem } from '$lib/fsa';

export class Edge implements FSAItem {
	id: string;
	from: Node;
	to: Node;
	label: string;

	constructor(from: Node, to: Node, label: string = '') {
		this.from = from;
		this.to = to;
		this.id = `${from.id}-->${to.id}`;
		this.label = label;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		return this.to.pos;
	}

	isLoopback(): boolean {
		return this.from.id === this.to.id;
	}
}

export class DraftEdge {
	from: Node;
	to: Point;
	pointingAtNode: boolean = false;

	constructor(from: Node, to: Point) {
		this.from = from;
		this.to = $state(to);
	}

	updateTarget(to: Point | Node): void {
		if (to instanceof Node) {
			this.to = to.pos;
			this.pointingAtNode = true;
		} else {
			this.to = to;
			this.pointingAtNode = false;
		}
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		return this.to;
	}
}
