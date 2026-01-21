import { type Point, midPoint, vectorBetween } from '$lib/geometry';
import { Node } from '$lib/automata/models/Node.svelte';
import {
	TransitionSymbol,
	type SerializedTransitionSymbol
} from '$lib/automata/models/TransitionSymbol.svelte';
import type { BaseEdge, FSAItem } from '$lib/automata/models/types';
import type { Serializable } from '$lib/utils/serialization';

/**
 * Serialized representation of an Edge.
 */
export interface SerializedEdge {
	fromNodeId: string;
	toNodeId: string;
	transitionSymbols: SerializedTransitionSymbol[];
	controlOffset: Point | null;
	loopbackAngle: number;
	forceStraight: boolean;
	forceAlignCenter: boolean;
}

/**
 * Represents a directed edge between two nodes in the FSA. It can have multiple transition
 * symbols associated with it, as well as curvature for visual representation.
 */
export class Edge implements BaseEdge, FSAItem, Serializable<SerializedEdge> {
	static readonly LOOPBACK_DEFAULT_ANGLE = Math.PI / 2; // default angle of loopback edges

	readonly id: string;
	readonly from: Node;
	readonly to: Node;
	readonly isLoopback: boolean;
	private _controlOffset = $state<Point | null>(null);
	private _loopbackAngle = $state<number>(Edge.LOOPBACK_DEFAULT_ANGLE);
	private _transitionSymbols: TransitionSymbol[] = $state<TransitionSymbol[]>([]);
	readonly label = $derived<string[]>(this._transitionSymbols.map((ts) => ts.toString()));
	forceStraight = $state<boolean>(false);
	forceAlignCenter = $state<boolean>(false);

	isStraight = $derived.by<boolean>(() => {
		return this.forceStraight || this._controlOffset === null;
	});

	controlPoint = $derived.by<Point>(() => {
		const referencePoint = midPoint(this.sourcePoint, this.targetPoint);
		if (this.isStraight) {
			return referencePoint;
		}
		const offset = this.forceAlignCenter ? this.offsetSnappedToCenter : this._controlOffset;
		// if the isStraight check is passed, it is guaranteed that controlOffset is not null
		return {
			x: referencePoint.x + offset!.x,
			y: referencePoint.y + offset!.y
		};
	});

	/**
	 * Calculates the control offset snapped to the center line between source and target, forcing the control point to align with the center line, and therefore resulting in a symmetric curve.
	 * @returns The centered control offset point.
	 */
	offsetSnappedToCenter = $derived.by<Point>(() => {
		if (this._controlOffset === null || this.isLoopback) {
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
	});

	constructor(from: Node, to: Node) {
		this.from = from;
		this.to = to;
		this.id = Edge.createId(from, to);
		this.isLoopback = from.id === to.id;
	}

	/**
	 * Creates an ID for an edge based on its source and target nodes.
	 * Since this is not a random ID, calling this with the same nodes will always return
	 * the same ID. Also, since no duplicate edges are allowed, this ID is guaranteed to be unique
	 * within an FSA.
	 * @param from The source node.
	 * @param to The target node.
	 * @returns A string representing the unique ID of the edge.
	 */
	static createId(from: Node, to: Node): string {
		return `${from.id}-->${to.id}`;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		return this.to.pos;
	}

	get loopbackAngle(): number {
		return this._loopbackAngle;
	}

	get transitionSymbols(): TransitionSymbol[] {
		return this._transitionSymbols;
	}

	/**
	 * Adds a new transition symbol to the edge, with or without stack operations.
	 * @param withStackOps True to create the transition symbol with stack operations, false otherwise.
	 */
	addTransition(withStackOps: boolean = false): void {
		this._transitionSymbols.push(TransitionSymbol.createEmpty(withStackOps));
	}

	/**
	 * Removes a transition symbol at the specified index.
	 * @param index The index of the transition symbol to remove.
	 */
	removeTransition(index: number): void {
		if (index >= 0 && index < this._transitionSymbols.length) {
			this._transitionSymbols.splice(index, 1);
		}
	}

	/**
	 * Adjusts the angle of the loopback edge.
	 * @param newAngle The new angle in radians.
	 */
	adjustLoopbackAngle(newAngle: number): void {
		this._loopbackAngle = newAngle;
	}

	/**
	 * Updates the control point (used to adjust the curvature of the edge) position.
	 * @param newPosition The new position of the control point.
	 */
	updateControlPoint(newPosition: Point): void {
		const referencePoint = midPoint(this.sourcePoint, this.targetPoint);
		this._controlOffset = {
			x: newPosition.x - referencePoint.x,
			y: newPosition.y - referencePoint.y
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
		if (!fromNode) {
			throw new Error(`Edge references missing source node: ${json.fromNodeId}`);
		}
		if (!toNode) {
			throw new Error(`Edge references missing target node: ${json.toNodeId}`);
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
