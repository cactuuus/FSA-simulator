import type { Point } from '$lib/geometry';
import { Node, type FSAItem, type BaseEdge, TransitionSymbol } from '$lib/automata/models';

/**
 * Represents a directed edge between two nodes in the FSA. It can have multiple transition
 * symbols associated with it, as well as curvature for visual representation.
 */
export class Edge implements BaseEdge, FSAItem {
	static readonly MIN_CURVATURE = 5; // helps snapping back to straight
	static readonly LOOPBACK_DEFAULT_CURVATURE = Math.PI / 2; // default position (angle) of loopback edges
	static readonly LOOPBACK_SIZE = 40; // fixed offset for loopback size
	static readonly LABEL_OFFSET = 40; // distance of the label from the arrow
	static readonly LINE_HEIGHT = 20; // height of each line in the label

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
