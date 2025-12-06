import type { EventContext } from '$lib/application/interaction';

export abstract class State {
	static readonly NAME: string;
	get name(): string {
		return (this.constructor as typeof State).NAME;
	}

	constructor() {}

	onEnter(): void {}
	onExit(): void {}

	handlePointerDown(_ctx: EventContext): void {}
	handlePointerUp(_ctx: EventContext): void {}
	handlePointerMove(_ctx: EventContext): void {}
	handlePointerOver(_ctx: EventContext): void {}
	handlePointerOut(_ctx: EventContext): void {}
	handleDoubleClick(_ctx: EventContext): void {}
}
