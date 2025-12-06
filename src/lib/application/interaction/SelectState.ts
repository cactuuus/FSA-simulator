import { State, type EventContext } from '$lib/application/interaction';
import { Node, Edge } from '$lib/automata/models';
import { editor } from '$lib/stores/editor.svelte';
import { angleTo } from '$lib/geometry';
import { getControlPointFromLabelPos } from '$lib/utils';

export class SelectState extends State {
	static readonly NAME = 'select';
	#isDragging = false;

	handlePointerDown(ctx: EventContext): void {
		if (ctx.isCanvas) {
			editor.selectionManager.clearSelection();
		} else if (ctx.node) {
			editor.selectionManager.selectItem(ctx.node);
			this.#isDragging = true;
		} else if (ctx.edge) {
			editor.selectionManager.selectItem(ctx.edge);
			this.#isDragging = true;
		}
	}

	handlePointerMove(ctx: EventContext): void {
		if (!this.#isDragging) return;

		const item = editor.selectionManager.selectedItem;
		if (item instanceof Node) {
			item.moveTo(ctx.pointerPos);
		} else if (item instanceof Edge) {
			if (item.isLoopback()) {
				const newAngle = angleTo(item.sourcePoint, ctx.pointerPos);
				item.adjustLoopbackAngle(newAngle);
			} else {
				// uses label position to determine new control point, for better UX
				const controlPoint = getControlPointFromLabelPos(item, ctx.pointerPos);
				item.updateControlPoint(controlPoint);
			}
		}
	}

	handlePointerUp(_ctx: EventContext): void {
		this.#isDragging = false;
	}

	handleDoubleClick(_ctx: EventContext): void {
		if (_ctx.node) {
			_ctx.node.toggleAccepting();
		}
	}
}
