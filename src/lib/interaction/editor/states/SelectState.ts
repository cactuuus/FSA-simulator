import { angleTo } from '$lib/utils/geometry';
import { EditorState } from '$lib/interaction/editor/EditorState';
import type { EventContext } from '$lib/interaction/SvgInputHandler';
import { Node, Edge } from '$lib/automata/models';
import { getControlPointFromLabelPos } from '$lib/automata/visuals';

/**
 * State for selecting and manipulating nodes and edges in the FSA graph.
 * By far the most complex state, handling selectiong of single and multiple items, selection box creation, movement of nodes (and by extension edges), adjustment of edge control points and loopback angles, and toggling accepting states.
 *
 * - Single click on empty canvas: clears selection.
 * - Single click on node/edge: selects/deselects the item (with Ctrl to multi-select).
 * - Double click on node: toggles its accepting state.
 * - Dragging on empty canvas: creates a selection box to select multiple items. When drag ends, selects all items within the box (with Ctrl to multi-select).
 * - Dragging on item: on start drag, if the item is not selected, selects the item first (with Ctrl to multi-select). Then, depending on the type and number of selected items:
 *  	- Single selected edge: adjusts its control point or loopback angle based on cursor position.
 * 		- One or more selected nodes: moves all selected nodes according to cursor movement.
 */
export class SelectState extends EditorState {
	static readonly NAME = 'select';
	private _startPointerPos: { x: number; y: number } | null = null;

	/**
	 * Resets internal state and destroys the selection box, if present.
	 */
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
			if (this.editorCtx.selection.isSelected(item.id)) {
				this.editorCtx.selection.deselect(item.id);
			} else {
				this.editorCtx.selection.select(item.id);
			}
		}
	}

	handleDragStart(ctx: EventContext): void {
		this.resetState();
		this._startPointerPos = ctx.pointerPos;

		// case 1: clicked on empty canvas
		if (ctx.isCanvas && this._startPointerPos) {
			if (!ctx.event.ctrlKey) {
				this.editorCtx.selection.clear();
			}
			this.editorCtx.selection.updateArea(this._startPointerPos, this._startPointerPos);
			return;
		}

		const item = ctx.node || ctx.edge;
		// case 2: clicked on a non selected item
		if (item && !this.editorCtx.selection.isSelected(item.id)) {
			if (ctx.event.ctrlKey) {
				this.editorCtx.selection.appendToSelection(item.id);
			} else {
				this.editorCtx.selection.select(item.id);
			}
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
			if (edge.isLoopback) {
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
			this.editorCtx.selection.select(ctx.node.id);
		}
	}
}
