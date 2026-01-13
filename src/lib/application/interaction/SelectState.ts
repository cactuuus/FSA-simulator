import { State } from '$lib/application/interaction/State';
import type { EventContext } from '$lib/application/interaction/types';
import { Node, Edge } from '$lib/automata/models';
import { angleTo } from '$lib/geometry';
import { getControlPointFromLabelPos } from '$lib/utils';

export class SelectState extends State {
	static readonly NAME = 'select';
	private _startPointerPos: { x: number; y: number } | null = null;

	private resetState() {
		this.editorCtx.selectionManager.destroySelectionArea();
		this._startPointerPos = null;
	}

	onExit(): void {
		this.resetState();
	}

	handleClick(ctx: EventContext): void {
		this.resetState();

		if (ctx.isCanvas) {
			this.editorCtx.selectionManager.clearSelection();
			return;
		}
		const item = ctx.node || ctx.edge;
		if (item) {
			if (this.editorCtx.selectionManager.isSelected(item)) {
				this.editorCtx.selectionManager.deselect(item);
			} else {
				this.editorCtx.selectionManager.select(item, ctx.event.ctrlKey);
			}
		}
	}

	handleDragStart(ctx: EventContext): void {
		this.resetState();
		this._startPointerPos = ctx.pointerPos;

		// case 1: clicked on empty canvas
		if (ctx.isCanvas) {
			if (!ctx.event.ctrlKey) {
				this.editorCtx.selectionManager.clearSelection();
			}
			this.editorCtx.selectionManager.updateSelectionArea(
				this._startPointerPos,
				this._startPointerPos
			);
			return;
		}

		const item = ctx.node || ctx.edge;
		// case 2: clicked on a non selected item
		if (item && !this.editorCtx.selectionManager.isSelected(item)) {
			this.editorCtx.selectionManager.select(item, ctx.event.ctrlKey);
		}
	}

	handleDragMove(ctx: EventContext): void {
		// safety check
		if (!this._startPointerPos) return;

		// case 1: we're making a selection box
		if (this.editorCtx.selectionManager.selectionArea) {
			this.editorCtx.selectionManager.updateSelectionArea(this._startPointerPos, ctx.pointerPos);
			return;
		}

		// case 2: we have a single edge selected
		const selection = this.editorCtx.selectionManager.selectedItems;
		if (selection.length === 1 && selection[0] instanceof Edge) {
			const edge = selection[0] as Edge;
			if (edge.isLoopback()) {
				const newAngle = angleTo(edge.sourcePoint, ctx.pointerPos);
				edge.adjustLoopbackAngle(newAngle);
			} else {
				// uses label position to determine new control point, for better UX
				const controlPoint = getControlPointFromLabelPos(edge, ctx.pointerPos);
				edge.updateControlPoint(controlPoint);
			}
			return;
		}

		// case 3: one or more nodes are selected
		const delta = {
			x: ctx.pointerPos.x - this._startPointerPos.x,
			y: ctx.pointerPos.y - this._startPointerPos.y
		};
		selection.forEach((item) => {
			if (item instanceof Node) {
				item.moveBy(delta);
			}
		});
		this._startPointerPos = ctx.pointerPos;
	}

	handleDragEnd(ctx: EventContext): void {
		if (this.editorCtx.selectionManager.selectionArea) {
			this.editorCtx.selectionManager.commitSelectionArea(ctx.event.ctrlKey);
		}
		this.resetState();
	}

	handleDoubleClick(ctx: EventContext): void {
		if (ctx.node) {
			ctx.node.toggleAccepting();
			this.editorCtx.selectionManager.select(ctx.node);
		}
	}
}
