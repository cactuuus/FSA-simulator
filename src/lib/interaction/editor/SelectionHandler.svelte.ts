import { SvelteSet } from 'svelte/reactivity';
import type { Point } from '$lib/utils/geometry';
import type { FSAItem, Edge, Node, FSAGraph } from '$lib/automata/models';

/**
 * Handler for selection of items in the editor.
 * Needed as selection itself can be complicated: this handles references to selected items, and handles logic for selection area as well.
 */
export class SelectionHandler {
	private _fsaGraph: FSAGraph;
	private _selectedIds = new SvelteSet<string>();
	private _selectionArea = $state<{ start: Point; end: Point } | null>(null);
	private _idsWithinArea = new SvelteSet<string>();

	constructor(fsaGraph: FSAGraph) {
		this._fsaGraph = fsaGraph;
	}

	/**
	 * List of currently VALID selected items. This is because since we store only IDs, it might be
	 * possible that some selected IDs no longer exist in the graph.
	 *
	 * NOTE: this also means that any operation perfomed on _ids triggers a O(n) update here.
	 */
	items: FSAItem[] = $derived(
		Array.from(this._selectedIds)
			.map((id) => this._fsaGraph.getItem(id))
			.filter((item): item is FSAItem => item !== null)
	);

	/**
	 * List of items currently in the selection area. Similar to `items` above, this filters out any invalid IDs.
	 *
	 * NOTE: this also means that any operation perfomed on _idsWithinArea triggers a O(n) update here.
	 */
	itemsInArea: FSAItem[] = $derived(
		Array.from(this._idsWithinArea)
			.map((id) => this._fsaGraph.getItem(id))
			.filter((item): item is FSAItem => item !== null)
	);

	/**
	 * Clears current selection and selects only the given items.
	 * @param ids IDs of the items to be selected.
	 */
	select(...ids: string[]): void {
		this.clear();
		this.appendToSelection(...ids);
	}

	/**
	 * Adds the given items to the current selection set.
	 * @param ids IDs of the items to be selected.
	 */
	appendToSelection(...ids: string[]): void {
		ids.forEach((id) => this._selectedIds.add(id));
	}

	/**
	 * Removes the given item from the selection set. Doesn't check if it was actually selected or not.
	 * @param id The ID of the item to be deselected.
	 */
	deselect(id: string): void {
		this._selectedIds.delete(id);
	}

	/**
	 * Checks wether the given item is currently selected.
	 * @param id The ID of the item to check.
	 * @returns True if selected, false otherwise.
	 */
	isSelected(id: string): boolean {
		return this._selectedIds.has(id);
	}

	/**
	 * Completely clears current selection.
	 */
	clear(): void {
		this._selectedIds.clear();
	}

	/**
	 * Simple getter for selection area.
	 */
	get area(): { start: Point; end: Point } | null {
		return this._selectionArea;
	}

	/**
	 * Updates the selection area, given a start and end point.
	 * @param start Start point
	 * @param end End point.
	 */
	updateArea(start: Point, end: Point): void {
		this._selectionArea = { start, end };

		const xMin = Math.min(start.x, end.x);
		const xMax = Math.max(start.x, end.x);
		const yMin = Math.min(start.y, end.y);
		const yMax = Math.max(start.y, end.y);

		this._idsWithinArea.clear();
		// Naive O(n) approach, potential for optimisation
		this._fsaGraph.nodes.forEach((node: Node) => {
			const pos = node.pos;
			if (pos.x >= xMin && pos.x <= xMax && pos.y >= yMin && pos.y <= yMax) {
				this._idsWithinArea.add(node.id);
			}
		});
		// Naive O(n) approach, potential for optimisation
		this._fsaGraph.edges.forEach((edge: Edge) => {
			const pos = edge.controlPoint;
			if (pos.x >= xMin && pos.x <= xMax && pos.y >= yMin && pos.y <= yMax) {
				this._idsWithinArea.add(edge.id);
			}
		});
	}

	/**
	 * Removes the selection area.
	 */
	destroyArea(): void {
		this._selectionArea = null;
		this._idsWithinArea.clear();
	}

	/**
	 * Checks wether the given item is in the selection area.
	 * @param item The item to check.
	 * @returns True if in selection area, false otherwise.
	 */
	isInArea(item: FSAItem): boolean {
		return this._idsWithinArea.has(item.id);
	}

	/**
	 * Commits the current selection area to the selected items set.
	 * @param append Flag indicating wether to append to current selection or not
	 * (true = add to current selection, false = clear selection first, then select only items in selection area)
	 */
	commitArea(append: boolean = false): void {
		if (!append) {
			this.clear();
		}
		this.itemsInArea.forEach((item) => {
			this._selectedIds.add(item.id);
		});
		this.destroyArea();
	}
}
