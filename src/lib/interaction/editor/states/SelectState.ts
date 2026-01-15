import { EditorState } from './EditorState';
import type { EventContext } from '$lib/interaction/SvgInputHandler';
import { Node, Edge } from '$lib/automata/models';
import { angleTo } from '$lib/geometry';
import { getControlPointFromLabelPos } from '$lib/utils';

export class SelectState extends EditorState {
	static readonly NAME = 'select';
	private _startPointerPos: { x: number; y: number } | null = null;

	private resetState() {
		this.editorCtx.selection.destroyArea();
		this._startPointerPos = null;
	}

	onExit(): void {
		this.resetState();
	}

	handleClick(ctx: EventContext): void {
		this.resetState();

		if (ctx.isCanvas) {
			this.editorCtx.selection.clear();
			return;
		}
		const item = ctx.node || ctx.edge;
		if (item) {
			if (this.editorCtx.selection.isSelected(item)) {
				this.editorCtx.selection.deselect(item);
			} else {
				this.editorCtx.selection.select(item, ctx.event.ctrlKey);
			}
		}
	}

	handleDragStart(ctx: EventContext): void {
		this.resetState();
		this._startPointerPos = ctx.pointerPos;

		// case 1: clicked on empty canvas
		if (ctx.isCanvas) {
			if (!ctx.event.ctrlKey) {
				this.editorCtx.selection.clear();
			}
			this.editorCtx.selection.updateArea(this._startPointerPos, this._startPointerPos);
			return;
		}

		const item = ctx.node || ctx.edge;
		// case 2: clicked on a non selected item
		if (item && !this.editorCtx.selection.isSelected(item)) {
			this.editorCtx.selection.select(item, ctx.event.ctrlKey);
		}
	}

	handleDragMove(ctx: EventContext): void {
		// safety check
		if (!this._startPointerPos) return;

		// case 1: we're making a selection box
		if (this.editorCtx.selection.area) {
			this.editorCtx.selection.updateArea(this._startPointerPos, ctx.pointerPos);
			return;
		}

		// case 2: we have a single edge selected
		const selection = this.editorCtx.selection.items;
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
		if (this.editorCtx.selection.area) {
			this.editorCtx.selection.commitArea(ctx.event.ctrlKey);
		}
		this.resetState();
	}

	handleDoubleClick(ctx: EventContext): void {
		if (ctx.node) {
			ctx.node.toggleAccepting();
			this.editorCtx.selection.select(ctx.node);
		}
	}
}
