import type { EventContext, EditorContext } from '$lib/application/interaction';

export abstract class State {
	static readonly NAME: string;
	protected editorCtx: EditorContext;

	constructor(editorContext: EditorContext) {
		this.editorCtx = editorContext;
	}

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
