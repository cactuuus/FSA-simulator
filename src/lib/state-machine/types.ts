import type { Point } from '$lib/fsa';

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
