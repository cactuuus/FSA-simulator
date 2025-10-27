import type { Node, Edge, Point } from '$lib/fsa';

export interface EventContext {
	event: MouseEvent;
	node?: Node;
	edge?: Edge;
	isCanvas: boolean;
	mousePos: Point;
}

export abstract class State {
	abstract readonly name: string;

	constructor() {}

	onEnter(): void {}
	onExit(): void {}

	handleClick(_ctx: EventContext): void {}
	handleMouseDown(_ctx: EventContext): void {}
	handleMouseUp(_ctx: EventContext): void {}
	handleMouseMove(_ctx: EventContext): void {}
	handleMouseOver(_ctx: EventContext): void {}
	handleMouseOut(_ctx: EventContext): void {}
}
