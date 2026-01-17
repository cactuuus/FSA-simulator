import type { EventContext } from './SvgInputHandler';

/**
 * Base class for different interaction states within the application.
 * Each state can override event handlers to implement specific behaviors.
 */
export abstract class State {
	static readonly NAME: string;
	get name(): string {
		return (this.constructor as typeof State).NAME;
	}

	/**
	 * Actions to perform when entering the state.
	 */
	onEnter(): void {}

	/**
	 * Actions to perform when exiting the state.
	 */
	onExit(): void {}

	// These are all event handlers for various interactions, they all expect an EventContext parameter, as to provide more specialised (in respect to our app) information about the event.
	handleDoubleClick(_ctx: EventContext): void {}
	handleDragStart?(_ctx: EventContext): void {}
	handleDragMove?(_ctx: EventContext): void {}
	handleDragEnd?(_ctx: EventContext): void {}
	handleClick?(_ctx: EventContext): void {}
}
