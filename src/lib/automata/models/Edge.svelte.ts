import { type Point, midPoint, vectorBetween } from '$lib/geometry';
import { Node, type FSAItem, type BaseEdge, TransitionSymbol } from '$lib/automata/models';
import type { SerializedEdge, Serializable } from '$lib/automata/serialisation';
import { UserFacingError } from '$lib/utils';

/**
 * Represents a directed edge between two nodes in the FSA. It can have multiple transition
 * symbols associated with it, as well as curvature for visual representation.
 */
export class Edge implements BaseEdge, FSAItem, Serializable<SerializedEdge> {
	static readonly LOOPBACK_DEFAULT_ANGLE = Math.PI / 2; // default angle of loopback edges
	static readonly LOOPBACK_SIZE = 40; // fixed offset for loopback size
	static readonly LABEL_OFFSET = 40; // distance of the label from the arrow
	static readonly LINE_HEIGHT = 20; // height of each line in the label
	static readonly LABEL_DISTANCE_BIAS = 0.5; // distance bias placing label between bezier midpoint and control point

	readonly id: string;
	readonly from: Node;
	readonly to: Node;
	private _transitionSymbols: TransitionSymbol[] = $state<TransitionSymbol[]>([]);
	readonly label = $derived<string[]>(this._transitionSymbols.map((ts) => ts.toString()));
	private _controlOffset = $state<Point | null>(null);
	private _loopbackAngle = $state<number>(Edge.LOOPBACK_DEFAULT_ANGLE);
	private _midpoint = $derived<Point>(midPoint(this.sourcePoint, this.targetPoint));
	forceStraight = $state<boolean>(false);
	forceAlignCenter = $state<boolean>(false);

	constructor(from: Node, to: Node) {
		this.from = from;
		this.to = to;
		this.id = Edge.createId(from, to);
		this.addTransition();
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
		if (this.isStraight()) {
			return this._midpoint;
		}
		const offset = this.forceAlignCenter ? this.getOffestSnappedToCenter() : this._controlOffset;
		// if the isStraight check is passed, it is guaranteed that controlOffsset is not null
		return {
			x: this._midpoint.x + offset!.x,
			y: this._midpoint.y + offset!.y
		};
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

	isStraight(): boolean {
		return this.forceStraight || this._controlOffset === null;
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

	updateControlPoint(newPosition: Point): void {
		this._controlOffset = {
			x: newPosition.x - this._midpoint.x,
			y: newPosition.y - this._midpoint.y
		};
	}

	private getOffestSnappedToCenter(): Point {
		if (this._controlOffset === null || this.isLoopback()) {
			return { x: 0, y: 0 };
		}
		// get unit vector perpendicular to the edge (considering the edge as a stright line)
		const edgeVector = vectorBetween(this.sourcePoint, this.targetPoint);
		const perpVector = {
			x: -edgeVector.y / edgeVector.magnitude,
			y: edgeVector.x / edgeVector.magnitude
		};
		// distance along the perpendicular direction
		const distance = this._controlOffset.x * perpVector.x + this._controlOffset.y * perpVector.y;
		return {
			x: distance * perpVector.x,
			y: distance * perpVector.y
		};
	}

	toJSON(): SerializedEdge {
		return {
			fromNodeId: this.from.id,
			toNodeId: this.to.id,
			transitionSymbols: this._transitionSymbols.map((ts) => ts.toJSON()),
			controlOffset: this._controlOffset,
			loopbackAngle: this._loopbackAngle,
			forceStraight: this.forceStraight,
			forceAlignCenter: this.forceAlignCenter
		};
	}

	static fromJSON(json: SerializedEdge, nodesMap: Map<string, Node>): Edge {
		const fromNode = nodesMap.get(json.fromNodeId);
		const toNode = nodesMap.get(json.toNodeId);
		if (!fromNode || !toNode) {
			console.error(
				`Invalid node IDs: ${json.fromNodeId}, ${json.toNodeId}.\nOne or both nodes do not exist.`
			);
			throw new UserFacingError(`Invalid node ID in edge data. See console for details.`);
		}
		const edge = new Edge(fromNode, toNode);
		edge._transitionSymbols = json.transitionSymbols.map((tsJson) =>
			TransitionSymbol.fromJSON(tsJson)
		);
		edge._controlOffset = json.controlOffset ?? null;
		edge._loopbackAngle = json.loopbackAngle ?? Edge.LOOPBACK_DEFAULT_ANGLE;
		edge.forceStraight = json.forceStraight ?? false;
		edge.forceAlignCenter = json.forceAlignCenter ?? false;
		return edge;
	}
}
