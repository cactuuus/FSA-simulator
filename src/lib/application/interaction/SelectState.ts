import { State, type EventContext } from '$lib/application/interaction';
import { Node, Edge } from '$lib/automata/models';
import { angleTo } from '$lib/geometry';
import { getControlPointFromLabelPos } from '$lib/utils';

export class SelectState extends State {
	static readonly NAME = 'select';
	private _startPointerPos: { x: number; y: number } | null = null;
	private _makingSelectionBox: boolean = false;

	/**
	 * Toggles selection of the given item.
	 * @param item The item to toggle selection for.
	 * @param append Optional flag indicating whether to append to current selection or not, used
	 * only when the item is to be selected.
	 */
	private toggleSelection(item: Node | Edge, append: boolean = false): void {
		if (this.editorCtx.selectionManager.isSelected(item)) {
			this.editorCtx.selectionManager.deselect(item);
		} else {
			this.editorCtx.selectionManager.select(item, append);
		}
	}

	handleClick(ctx: EventContext): void {
		this._makingSelectionBox = false;
		this._startPointerPos = null;
		if (ctx.isCanvas) {
			this.editorCtx.selectionManager.clearSelection();
			return;
		}
		const item = ctx.node || ctx.edge;
		if (item) {
			this.toggleSelection(item, ctx.event.ctrlKey);
		}
	}

	handleDragStart(ctx: EventContext): void {
		this._startPointerPos = ctx.pointerPos;

		// case 1: clicked on empty canvas
		if (ctx.isCanvas) {
			this.editorCtx.selectionManager.clearSelection();
			this._makingSelectionBox = true;
			// TODO: start drawing a selection box
			return;
		}

		this._makingSelectionBox = false;
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
		if (this._makingSelectionBox) {
			// update selection box drawing
			// possibly update selection in real time, as the box is dragged?
			return;
		}

		// case 2: we have a single edge selected
		const selection = this.editorCtx.selectionManager.selectedItems;
		if (selection.length === 1 && selection[0] instanceof Edge) {
			console.log('edge clicked');

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

	handleDoubleClick(ctx: EventContext): void {
		if (ctx.node) {
			ctx.node.toggleAccepting();
		}
	}
}
