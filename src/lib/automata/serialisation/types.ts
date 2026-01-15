import type { Point } from '$lib/geometry';

/**
 * Interface for serializable objects. Forces the implementation of a toJson method, used by the
 * JSON.stringify function.
 * Note: all classes will also be implementing a static fromJSON method, but this cannot be enforced
 * via interfaces in TypeScript.
 * @template T The type returned by the toJSON method.
 */
export interface Serializable<T> {
	toJSON(): T;
	// fromJSON(json: T): Serializable<T>; // to be implemented manually in each class
}

/**
 * Serialized representation of a Node.
 */
export interface SerializedNode {
	id: string;
	pos: Point;
	label: string;
	isAccepting: boolean;
}

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
 * Serialized representation of a TransitionSymbol.
 */
export interface SerializedTransitionSymbol {
	consume: string;
	pop: string;
	push: string;
}

/**
 * Serialized representation of an entire FSA graph.
 */
export interface SerializedFSAGraph {
	title: string;
	nodes: SerializedNode[];
	edges: SerializedEdge[];
	startNodeId: string | null;
}
