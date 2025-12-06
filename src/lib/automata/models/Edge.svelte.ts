import { type Point, midPoint } from '$lib/geometry';
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
	static readonly LABEL_DISTANCE_BIAS = 0.5; // distance bias placing label between bezier midppoint and control point

	readonly id: string;
	readonly from: Node;
	readonly to: Node;
	private _transitionSymbols: TransitionSymbol[] = $state<TransitionSymbol[]>([]);
	readonly label = $derived<string[]>(this._transitionSymbols.map((ts) => ts.toString()));
	private _controlPoint = $state<Point>({ x: 0, y: 0 }); // dummy point, real value is set in constructor
	private _loopbackAngle = $state<number>(Edge.LOOPBACK_DEFAULT_CURVATURE);

	constructor(from: Node, to: Node) {
		this.from = from;
		this.to = to;
		this.id = Edge.createId(from, to);
		this.addTransition();
		this._controlPoint = midPoint(this.sourcePoint, this.targetPoint);
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

	get controlPoint(): Point {
		return this._controlPoint;
	}

	get loopbackAngle(): number {
		return this._loopbackAngle;
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

	adjustLoopbackAngle(newAngle: number): void {
		this._loopbackAngle = newAngle;
	}

	updateControlPoint(newControlPoint: Point): void {
		this._controlPoint = newControlPoint;
	}
}
