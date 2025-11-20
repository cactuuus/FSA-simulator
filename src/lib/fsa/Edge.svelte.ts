import { Node, type Point, type FSAItem } from '$lib/fsa';

export class Edge implements FSAItem {
	id: string;
	from: Node;
	to: Node;
	label: string;

	constructor(from: Node, to: Node, label: string = '') {
		this.from = from;
		this.to = to;
		this.id = Edge.createId(from, to);
		this.label = label;
	}

	public static createId(from: Node, to: Node): string {
		return `${from.id}-->${to.id}`;
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
	to: Point | Node;
	pointingAtNode: boolean;
	isDuplicate: boolean;

	constructor(from: Node, to: Point | Node, isDuplicate: boolean) {
		this.from = from;
		this.to = $state(to);
		this.pointingAtNode = $state(to instanceof Node);
		this.isDuplicate = $state(isDuplicate);
	}

	updateTarget(to: Point | Node, isDuplicate: boolean): void {
		if (to instanceof Node) {
			this.to = to;
			this.pointingAtNode = true;
		} else {
			this.to = to;
			this.pointingAtNode = false;
		}
		this.isDuplicate = isDuplicate;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		if (this.to instanceof Node) {
			return this.to.pos;
		}
		return this.to;
	}

	isLoopback(): boolean {
		if (this.to instanceof Node) {
			return this.from.id === this.to.id;
		}
		return false;
	}
}
