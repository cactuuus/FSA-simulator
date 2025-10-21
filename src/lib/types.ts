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

export interface CanvasState {
	name: string;
	cursor?: string;

	onEnter?(fsa: FSA): void;
	onExit?(fsa: FSA): void;
	onMouseDown?(pos: Point, fsa: FSA): void;
	onMouseMove?(pos: Point, fsa: FSA): void;
	onMouseUp?(pos: Point, fsa: FSA): void;
	onClick?(pos: Point, fsa: FSA): void;
}
