import type { Point } from '$lib/geometry';

/**
 * Interface for serializable objects. Forces the implementation of a toJson method, used by the
 * JSON.stringify function.
 */
export interface Serializable<T> {
	toJSON(): T;
}

export interface SerializedNode {
	id: string;
	pos: Point;
	label: string;
	isAccepting: boolean;
}

export interface SerializedEdge {
	fromNodeId: string;
	toNodeId: string;
	transitionSymbols: SerializedTransitionSymbol[];
	controlOffset: Point | null;
	loopbackAngle: number;
}

export interface SerializedTransitionSymbol {
	consume: string;
	pop: string;
	push: string;
}

export interface SerializedFSAGraph {
	nodes: SerializedNode[];
	edges: SerializedEdge[];
	startNodeId: string | null;
}
