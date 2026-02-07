import { SvelteMap } from 'svelte/reactivity';
import { type Point, midPoint, vectorBetween } from '$lib/utils/geometry';
import type { Serializable } from '$lib/utils/serialization';
import type { BaseEdge, FSAItem } from './types';
import { Node } from './Node.svelte';
import { Transition, type SerializedTransition } from './Transition.svelte';

/**
 * Serialized representation of an Edge.
 */
export interface SerializedEdge {
	fromNodeId: string;
	toNodeId: string;
	transitions: SerializedTransition[];
	controlPointOffset: Point;
	isSymmetric: boolean;
}

/**
 * Represents a directed edge between two nodes in the FSA. It can have multiple transition
 * symbols associated with it, as well as curvature for visual representation.
 */
export class Edge implements BaseEdge, FSAItem, Serializable<SerializedEdge> {
	static readonly DEFAULT_CONTROL_OFFSET: Point = { x: 0, y: 0 };

	readonly id: string;
	readonly from: Node;
	readonly to: Node;
	readonly isLoopback: boolean;
	private _referencePoint = $derived<Point>(midPoint(this.sourcePoint, this.targetPoint));
	private _transitionsMap = new SvelteMap<string, Transition>();
	private _controlPointOffset = $state<Point>(Edge.DEFAULT_CONTROL_OFFSET);
	isSymmetric = $state<boolean>(false);
	transitions = $derived<Transition[]>(Array.from(this._transitionsMap.values()));
	hasDefaultControlPoint = $derived<boolean>(
		this._controlPointOffset.x === Edge.DEFAULT_CONTROL_OFFSET.x &&
			this._controlPointOffset.y === Edge.DEFAULT_CONTROL_OFFSET.y
	);

	/**
	 * The control point is used to determine the curvature of the edge when rendered.
	 * It stays relative to the edge's reference point, which is the midpoint between source and target nodes, so that it moves accordingly when nodes are moved.
	 */
	controlPoint = $derived.by<Point>(() => {
		const offset = this.isSymmetric
			? this.projectToPerpendicular(this._controlPointOffset)
			: this._controlPointOffset;
		return {
			x: this._referencePoint.x + offset.x,
			y: this._referencePoint.y + offset.y
		};
	});

	constructor(from: Node, to: Node, id?: string) {
		this.from = from;
		this.to = to;
		this.id = id ?? Edge.createId(from.id, to.id);
		this.isLoopback = from.id === to.id;
	}

	/**
	 * Creates an ID for an edge based on its source and target nodes.
	 * Since this is not a random ID, calling this with the same nodes will always return
	 * the same ID. Also, since no duplicate edges are allowed, this ID is guaranteed to be unique
	 * within an FSA.
	 * @param fromId The ID of the source node.
	 * @param toId The ID of the target node.
	 * @returns A string representing the unique ID of the edge.
	 */
	static createId(fromId: string, toId: string): string {
		return `${fromId}-->${toId}`;
	}

	get sourcePoint(): Point {
		return this.from.pos;
	}

	get targetPoint(): Point {
		return this.to.pos;
	}

	/**
	 * Resets the control point to its default position by setting the control point offset to the default value.
	 */
	resetControlPoint(): void {
		this._controlPointOffset = Edge.DEFAULT_CONTROL_OFFSET;
	}

	/**
	 * Helper function for aligning the control point to be perpendicular to the edge direction.
	 * @param offset The original control point offset to project to the perpendicular direction.
	 * @returns The adjusted control point offset, perpendicular to the edge direction.
	 */
	private projectToPerpendicular(offset: Point): Point {
		const edgeVector = vectorBetween(this.sourcePoint, this.targetPoint);
		if (edgeVector.magnitude === 0) {
			// return default offset to avoid division by zero
			return Edge.DEFAULT_CONTROL_OFFSET;
		}
		const perpVector = {
			x: -edgeVector.y / edgeVector.magnitude,
			y: edgeVector.x / edgeVector.magnitude
		};
		const distance = offset.x * perpVector.x + offset.y * perpVector.y;
		return { x: distance * perpVector.x, y: distance * perpVector.y };
	}

	/**
	 * Adds a new transition symbol to the edge, with or without stack operations.
	 * @param withStackOps True to create the transition symbol with stack operations, false otherwise.
	 * @param id Optional ID for the new transition symbol.
	 */
	addEmptyTransition(withStackOps: boolean = false, id: string): void {
		const newTransition = Transition.createEmpty(withStackOps, id);
		this._transitionsMap.set(newTransition.id, newTransition);
	}

	/**
	 * Adds existing transition(s) to the edge.
	 * @param transitions One or more Transition objects to add to the edge.
	 */
	addTransitions(...transitions: Transition[]): void {
		transitions.forEach((transition) => {
			if (this._transitionsMap.has(transition.id)) {
				throw new Error(`Transition with ID ${transition.id} already exists on edge ${this.id}`);
			}
			this._transitionsMap.set(transition.id, transition);
		});
	}

	/**
	 * Checks if the edge has a specific transition.
	 * @param id The ID of the transition to check.
	 * @returns True if the transition exists on the edge, false otherwise.
	 */
	hasTransition(id: string): boolean {
		return this._transitionsMap.has(id);
	}

	/**
	 * Removes transition(s).
	 * @param ids The IDs of the transitions to remove.
	 */
	deleteTransitions(...ids: string[]): void {
		ids.forEach((id) => {
			if (!this._transitionsMap.has(id)) {
				throw new Error(`Transition with ID ${id} does not exist on edge ${this.id}`);
			}
			this._transitionsMap.delete(id);
		});
	}

	/**
	 * Updates the control point (used to adjust the curvature of the edge) position.
	 * @param newPosition The new position of the control point.
	 */
	updateControlPoint(newPosition: Point): void {
		this._controlPointOffset = {
			x: newPosition.x - this._referencePoint.x,
			y: newPosition.y - this._referencePoint.y
		};
	}

	toJSON(): SerializedEdge {
		return {
			fromNodeId: this.from.id,
			toNodeId: this.to.id,
			transitions: this.transitions.map((ts) => ts.toJSON()),
			controlPointOffset: this._controlPointOffset,
			isSymmetric: this.isSymmetric
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
		edge._transitionsMap = new SvelteMap();
		edge.addTransitions(...json.transitions.map((t) => Transition.fromJSON(t)));
		edge._controlPointOffset = json.controlPointOffset ?? { x: 0, y: 0 };
		edge.isSymmetric = json.isSymmetric ?? false;
		return edge;
	}
}
