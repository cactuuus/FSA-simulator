import type { FSA } from './fsa/FSA.svelte';

export interface Point {
	x: number;
	y: number;
}

export interface Node {
	id: string;
	pos: Point;
	label: string;
	isStart: boolean;
	isAccepting: boolean;
}

export interface Edge {
	id: string;
	from: Node;
	to: Node;
	label: string;
}

export interface ActiveEdge {
	from: Node;
	toPoint: Point;
}

export interface GraphData {
	nodes: Node[];
	edges: Edge[];
}

export interface State {
	name: string;

	onEnter?(): void;
	onExit?(): void;
}

export interface CanvasState extends State {
	cursor?: string;
	onMouseDown?(pos: Point): void;
	onMouseMove?(pos: Point): void;
	onMouseUp?(pos: Point): void;
	onClick?(pos: Point): void;
}
