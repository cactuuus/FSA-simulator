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

	handlePointerDown(_ctx: EventContext): void {}
	handlePointerUp(_ctx: EventContext): void {}
	handlePointerMove(_ctx: EventContext): void {}
	handlePointerOver(_ctx: EventContext): void {}
	handlePointerOut(_ctx: EventContext): void {}
	handleDoubleClick(_ctx: EventContext): void {}
}
