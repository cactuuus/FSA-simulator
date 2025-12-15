import { State, type EventContext } from '$lib/application/interaction';
import { Node, Edge } from '$lib/automata/models';
import { angleTo } from '$lib/geometry';
import { getControlPointFromLabelPos } from '$lib/utils';

export class SelectState extends State {
	static readonly NAME = 'select';
	#isDragging = false;

	handlePointerDown(ctx: EventContext): void {
		if (ctx.isCanvas) {
			this.editorCtx.selectionManager.clearSelection();
		} else if (ctx.node) {
			this.editorCtx.selectionManager.select(ctx.node);
			this.#isDragging = true;
		} else if (ctx.edge) {
			this.editorCtx.selectionManager.select(ctx.edge);
			this.#isDragging = true;
		}
	}

	handlePointerMove(ctx: EventContext): void {
		if (!this.#isDragging) return;

		const item = this.editorCtx.selectionManager.selectedItems[0]; // TODO: actually handle checking items selected
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
