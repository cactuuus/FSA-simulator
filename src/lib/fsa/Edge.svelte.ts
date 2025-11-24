import { Node, type Point, type FSAItem } from '$lib/fsa';

export class TransitionSymbol {
	static readonly EPSILON = 'ε';

	consume = $state<string>(TransitionSymbol.EPSILON);
	pop = $state<string>('');
	push = $state<string>('');

	constructor(consume: string, push: string = '', pop: string = '') {
		this.consume = consume;
		this.push = push;
		this.pop = pop;
	}

	hasPop(): boolean {
		return this.pop !== '';
	}

	hasPush(): boolean {
		return this.push !== '';
	}

	requiresStackOp(): boolean {
		return this.hasPop() || this.hasPush();
	}

	toString(): string {
		if (this.requiresStackOp()) {
			const popOperation = this.hasPop() ? this.pop : '?';
			const pushOperation = this.hasPush() ? this.push : '?';
			return `${this.consume}, ${popOperation} ⟶ ${pushOperation}`;
		}
		return `${this.consume}`;
	}
}

export class Edge implements FSAItem {
	static readonly MIN_CURVATURE = 5; // helps snapping back to straight

	id: string;
	from: Node;
	to: Node;
	transitionSymbols: TransitionSymbol[] = $state<TransitionSymbol[]>([]);
	label = $derived<string[]>(this.transitionSymbols.map((ts) => ts.toString()));
	curvature = $state<number>(0);

	constructor(from: Node, to: Node) {
		this.from = from;
		this.to = to;
		this.id = Edge.createId(from, to);
		this.addTransition();
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

	addTransition(): void {
		this.transitionSymbols.push(new TransitionSymbol(TransitionSymbol.EPSILON));
	}

	removeTransition(index: number): void {
		if (index >= 0 && index < this.transitionSymbols.length) {
			this.transitionSymbols.splice(index, 1);
		}
	}

	adjustCurvature(newCurvature: number): void {
		const overThreshold = Math.abs(newCurvature) >= Edge.MIN_CURVATURE;
		this.curvature = overThreshold ? newCurvature : 0;
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
