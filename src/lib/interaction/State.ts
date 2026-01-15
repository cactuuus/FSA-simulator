import type { EventContext } from './SvgInputHandler';

export abstract class State {
	static readonly NAME: string;
	get name(): string {
		return (this.constructor as typeof State).NAME;
	}
	onEnter(): void {}
	onExit(): void {}
	handleDoubleClick(_ctx: EventContext): void {}
	handleDragStart?(_ctx: EventContext): void {}
	handleDragMove?(_ctx: EventContext): void {}
	handleDragEnd?(_ctx: EventContext): void {}
	handleClick?(_ctx: EventContext): void {}
}
