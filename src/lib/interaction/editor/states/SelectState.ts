import type { Point } from '$lib/utils/geometry';
import { EditorState, type EditorContext } from '$lib/interaction/editor/EditorState';
import type { EventContext } from '$lib/interaction/SvgInputHandler';
import { Node, Edge } from '$lib/automata/models';
import { getControlPointFromLabelPos } from '$lib/automata/visuals';
import {
	ToggleNodeAcceptingCommand,
	MoveNodesCommand,
	AdjustEdgeShapeCommand
} from '$lib/interaction/editor/commands';

/**
 * Base class for actions that involve dragging in the editor. Useful here since drag actions in this state can be quite complicated.
 */
abstract class DragAction {
	abstract handleMove(_eventCtx: EventContext, _editorCtx: EditorContext): void;
	abstract handleEnd(_eventCtx: EventContext, _editorCtx: EditorContext): void;
}

/**
 * Action for managing the selection box during dragging.
 */
class SelectBoxAction extends DragAction {
	private _initialPos: Point;

	constructor(initialPos: Point) {
		super();
		this._initialPos = initialPos;
	}

	handleMove(eventCtx: EventContext, editorCtx: EditorContext): void {
		editorCtx.selection.updateArea(this._initialPos, eventCtx.pointerPos);
	}

	handleEnd(eventCtx: EventContext, editorCtx: EditorContext): void {
		editorCtx.selection.commitArea(eventCtx.event.ctrlKey);
	}
}

/**
 * Action for moving one or more selected nodes during dragging. Edges connected to the moved nodes are automatically updated since they reference the nodes' positions directly, so there is no need for them to be included here.
 */
class MoveNodesAction extends DragAction {
	private _nodes: Node[];
	private _initialPos: Point;
	private _lastPos: Point;

	constructor(nodesSelected: Node[], initialPos: Point) {
		super();
		this._nodes = nodesSelected;
		this._initialPos = initialPos;
		this._lastPos = initialPos;
	}

	handleMove(eventCtx: EventContext, _editorCtx: EditorContext): void {
		const delta = {
			x: eventCtx.pointerPos.x - this._lastPos.x,
			y: eventCtx.pointerPos.y - this._lastPos.y
		};
		this._nodes.forEach((node) => node.moveBy(delta));
		this._lastPos = eventCtx.pointerPos;
	}

	handleEnd(_eventCtx: EventContext, _editorCtx: EditorContext): void {
		const nodeIds = this._nodes.map((node) => node.id);
		const totalOffset = {
			x: this._lastPos.x - this._initialPos.x,
			y: this._lastPos.y - this._initialPos.y
		};
		const command = new MoveNodesCommand(totalOffset, ...nodeIds);
		_editorCtx.commandHistory.push(command);
	}
}

/**
 * Action for adjusting the control point of a single selected (non-loopback) edge during dragging.
 */
class AdjustEdgeShapeAction extends DragAction {
	private _edge: Edge;
	private _initialControlPoint: Point;

	constructor(edge: Edge, initialControlPoint: Point) {
		super();
		this._edge = edge;
		this._initialControlPoint = initialControlPoint;
	}

	handleMove(eventCtx: EventContext, _editorCtx: EditorContext): void {
		const controlPoint = getControlPointFromLabelPos(this._edge, eventCtx.pointerPos);
		this._edge.updateControlPoint(controlPoint);
	}

	handleEnd(_eventCtx: EventContext, _editorCtx: EditorContext): void {
		const command = new AdjustEdgeShapeCommand({
			edgeId: this._edge.id,
			initialControlPoint: this._initialControlPoint,
			finalControlPoint: this._edge.controlPoint
		});
		_editorCtx.commandHistory.push(command);
	}
}

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
	private _dragAction: DragAction | null = null;

	/**
	 * Resets internal state and destroys the selection box, if present.
	 */
	private resetState() {
		this.editorCtx.selection.destroyArea();
		this._dragAction = null;
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
			if (ctx.event.ctrlKey) {
				if (this.editorCtx.selection.isSelected(item.id)) {
					this.editorCtx.selection.deselect(item.id);
				} else {
					this.editorCtx.selection.appendToSelection(item.id);
				}
			} else {
				this.editorCtx.selection.select(item.id);
			}
		}
	}

	handleDragStart(ctx: EventContext): void {
		this.resetState();

		// case 1: clicked on empty canvas
		if (ctx.isCanvas) {
			if (!ctx.event.ctrlKey) {
				this.editorCtx.selection.clear();
			}
			this._dragAction = new SelectBoxAction(ctx.pointerPos);
			return;
		}

		// case 2: clicked on an item
		// if the item is not selected, select it first (with Ctrl to multi-select)
		// then start drag action based on type and number of selected items
		const item = ctx.node || ctx.edge;
		if (item && !this.editorCtx.selection.isSelected(item.id)) {
			if (ctx.event.ctrlKey) {
				this.editorCtx.selection.appendToSelection(item.id);
			} else {
				this.editorCtx.selection.select(item.id);
			}
		}
		const selection = this.editorCtx.selection.items;
		if (selection.length === 1 && selection[0] instanceof Edge) {
			const edge = selection[0] as Edge;
			this._dragAction = new AdjustEdgeShapeAction(edge, edge.controlPoint);
		} else {
			const nodesSelected = selection.filter((item) => item instanceof Node) as Node[];
			if (nodesSelected.length > 0) {
				this._dragAction = new MoveNodesAction(nodesSelected, ctx.pointerPos);
			}
		}
	}

	handleDragMove(ctx: EventContext): void {
		// safety check
		if (!this._dragAction) return;
		this._dragAction.handleMove(ctx, this.editorCtx);
	}

	handleDragEnd(ctx: EventContext): void {
		// safety check
		if (!this._dragAction) return;
		this._dragAction.handleEnd(ctx, this.editorCtx);
		this.resetState();
	}

	handleDoubleClick(ctx: EventContext): void {
		if (ctx.node) {
			this.editorCtx.commandHistory.pushAndExecute(
				new ToggleNodeAcceptingCommand(ctx.node.id, !ctx.node.isAccepting)
			);
			if (ctx.event.ctrlKey) {
				this.editorCtx.selection.appendToSelection(ctx.node.id);
			} else {
				this.editorCtx.selection.select(ctx.node.id);
			}
		}
	}
}
