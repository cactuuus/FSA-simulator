import type { EventContext } from '$lib/utils/types';

export abstract class State {
	static readonly NAME: string;
	get name(): string {
		return (this.constructor as typeof State).NAME;
	}

	constructor() {}

	onEnter(): void {}
	onExit(): void {}

	handleClick(_ctx: EventContext): void {}
	handleMouseDown(_ctx: EventContext): void {}
	handleMouseUp(_ctx: EventContext): void {}
	handleMouseMove(_ctx: EventContext): void {}
	handleMouseOver(_ctx: EventContext): void {}
	handleMouseOut(_ctx: EventContext): void {}
	handleDoubleClick(_ctx: EventContext): void {}
}
