import { SvelteMap } from 'svelte/reactivity';
import { type Point, midPoint } from '$lib/utils/geometry';
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
	forceStraight: boolean;
	forceAlignCenter: boolean;
}

/**
 * Represents a directed edge between two nodes in the FSA. It can have multiple transition
 * symbols associated with it, as well as curvature for visual representation.
 */
export class Edge implements BaseEdge, FSAItem, Serializable<SerializedEdge> {
	readonly id: string;
	readonly from: Node;
	readonly to: Node;
	readonly isLoopback: boolean;
	private _referencePoint = $derived<Point>(midPoint(this.sourcePoint, this.targetPoint));
	private _transitionsMap = new SvelteMap<string, Transition>();
	private _controlPointOffset = $state<Point>({ x: 0, y: 0 });
	forceStraight = $state<boolean>(false);
	forceAlignCenter = $state<boolean>(false);
	transitions = $derived<Transition[]>(Array.from(this._transitionsMap.values()));
	controlPoint = $derived<Point>({
		x: this._referencePoint.x + this._controlPointOffset.x,
		y: this._referencePoint.y + this._controlPointOffset.y
	});

	constructor(from: Node, to: Node) {
		this.from = from;
		this.to = to;
		this.id = Edge.createId(from.id, to.id);
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

	hasDefaultControlPoint(): boolean {
		return this._controlPointOffset.x === 0 && this._controlPointOffset.y === 0;
	}

	/**
	 * Adds a new transition symbol to the edge, with or without stack operations.
	 * @param withStackOps True to create the transition symbol with stack operations, false otherwise.
	 */
	addTransition(withStackOps: boolean = false): void {
		const newTransition = Transition.createEmpty(withStackOps);
		this._transitionsMap.set(newTransition.id, newTransition);
	}

	/**
	 * Checks if the edge has a specific transition.
	 * @param transition The transition to check.
	 * @returns True if the transition exists on the edge, false otherwise.
	 */
	hasTransition(transition: Transition): boolean {
		return this._transitionsMap.has(transition.id);
	}

	/**
	 * Removes a transition.
	 * @param transition The transition to remove.
	 */
	removeTransition(transition: Transition) {
		this._transitionsMap.delete(transition.id);
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
		edge._transitionsMap = new SvelteMap();
		json.transitions.forEach((transitionJson) => {
			const transition = Transition.fromJSON(transitionJson);
			edge._transitionsMap.set(transition.id, transition);
		});
		edge._controlPointOffset = json.controlPointOffset ?? { x: 0, y: 0 };
		edge.forceStraight = json.forceStraight ?? false;
		edge.forceAlignCenter = json.forceAlignCenter ?? false;
		return edge;
	}
}
