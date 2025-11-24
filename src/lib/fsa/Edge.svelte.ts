import { Node, type Point, type FSAItem } from '$lib/fsa';

/**
 * Defines the transition symbol for an edge in the FSA. It includes the input symbol to consume,
 * as well as optional stack operations (pop and push) for PDAs.
 */
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

/**
 * Base interface for edges in the FSA. Defines common properties and methods for regular and draft
 * edges for convenience when drawing them.
 */
export interface BaseEdge {
	readonly id: string;
	isLoopback(): boolean;
	get sourcePoint(): Point;
	get targetPoint(): Point;
	get curvature(): number;
}

/**
 * Represents a directed edge between two nodes in the FSA. It can have multiple transition
 * symbols associated with it, as well as curvature for visual representation.
 */
export class Edge implements BaseEdge, FSAItem {
	static readonly MIN_CURVATURE = 5; // helps snapping back to straight
	static readonly LOOPBACK_DEFAULT_CURVATURE = Math.PI / 2;

	readonly id: string;
	readonly from: Node;
	readonly to: Node;
	private _transitionSymbols: TransitionSymbol[] = $state<TransitionSymbol[]>([]);
	readonly label = $derived<string[]>(this._transitionSymbols.map((ts) => ts.toString()));
	private _curvature = $state<number>(0);

	constructor(from: Node, to: Node) {
		this.from = from;
		this.to = to;
		this.id = Edge.createId(from, to);
		this.addTransition();
		if (this.isLoopback()) {
			this._curvature = Edge.LOOPBACK_DEFAULT_CURVATURE;
		}
	}

	static createId(from: Node, to: Node): string {
		return `${from.id}-->${to.id}`;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		return this.to.pos;
	}

	get curvature(): number {
		return this._curvature;
	}

	get transitionSymbols(): TransitionSymbol[] {
		return this._transitionSymbols;
	}

	isLoopback(): boolean {
		return this.from.id === this.to.id;
	}

	addTransition(): void {
		this._transitionSymbols.push(new TransitionSymbol(TransitionSymbol.EPSILON));
	}

	removeTransition(index: number): void {
		if (index >= 0 && index < this._transitionSymbols.length) {
			this._transitionSymbols.splice(index, 1);
		}
	}

	adjustCurvature(newCurvature: number): void {
		if (this.isLoopback()) {
			this._curvature = newCurvature;
			return;
		}
		const overThreshold = Math.abs(newCurvature) >= Edge.MIN_CURVATURE;
		this._curvature = overThreshold ? newCurvature : 0;
	}
}

/**
 * Represents a temporary edge being drawn on the canvas. Used purely for visual feedback during
 * edge creation before the actual edge is drawn.
 */
export class DraftEdge implements BaseEdge {
	readonly id: string = 'draft-edge';
	readonly from: Node;
	private _to = $state<Point | Node>({ x: 0, y: 0 });
	private _pointingAtNode = $state<boolean>(false);
	private _isDuplicate = $state<boolean>(false);

	constructor(from: Node, to: Point | Node, isDuplicate: boolean) {
		this.from = from;
		this._to = to;
		this._pointingAtNode = to instanceof Node;
		this._isDuplicate = isDuplicate;
	}

	updateTarget(to: Point | Node, isDuplicate: boolean): void {
		if (to instanceof Node) {
			this._to = to;
			this._pointingAtNode = true;
		} else {
			this._to = to;
			this._pointingAtNode = false;
		}
		this._isDuplicate = isDuplicate;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		if (this._to instanceof Node) {
			return this._to.pos;
		}
		return this._to;
	}

	get curvature(): number {
		return this.isLoopback() ? Edge.LOOPBACK_DEFAULT_CURVATURE : 0;
	}

	get pointingAtNode(): boolean {
		return this._pointingAtNode;
	}

	get isDuplicate(): boolean {
		return this._isDuplicate;
	}

	isLoopback(): boolean {
		if (this._to instanceof Node) {
			return this.from.id === this._to.id;
		}
		return false;
	}
}
