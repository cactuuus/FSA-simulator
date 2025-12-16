import type { Point } from '$lib/geometry';
import type { FSAGraph, FSAItem } from '$lib/automata/models';
import { SvelteSet } from 'svelte/reactivity';

export class SelectionManager {
	private _fsaGraph: FSAGraph;
	private _selectedIds = new SvelteSet<string>();
	private _selectionArea = $state<{ start: Point; end: Point } | null>(null);
	private _inSelectionAreaIds = new SvelteSet<string>();

	/**
	 * List of currently VALID selected items. This is because since we store only IDs, it might be
	 * possible that some selected IDs no longer exist in the graph.
	 *
	 * NOTE: this also means that any operation perfomed on _selectedIds triggers a O(n) update here.
	 */
	selectedItems: FSAItem[] = $derived(
		Array.from(this._selectedIds)
			.map((id) => this._fsaGraph.getItemFromId(id))
			.filter((item): item is FSAItem => item !== null)
	);

	inSelectionAreaItems: FSAItem[] = $derived(
		Array.from(this._inSelectionAreaIds)
			.map((id) => this._fsaGraph.getItemFromId(id))
			.filter((item): item is FSAItem => item !== null)
	);

	constructor(fsaGraph: FSAGraph) {
		this._fsaGraph = fsaGraph;
	}

	/**
	 * Simple getter for the FSA graph used by the selection manager.
	 */
	get fsaGraph(): FSAGraph {
		return this._fsaGraph;
	}

	/**
	 * Add the given item(s) to the selection set.
	 * @param items Item or items to be selected.
	 * @param append Flag indicating wether to append to current selection or not
	 * (true = add to current selection, false = clear selection first, then select only this one item)
	 */
	select(items: FSAItem | FSAItem[], append: boolean = false): void {
		if (!append) {
			this.clearSelection();
		}
		if (Array.isArray(items)) {
			items.forEach((item) => this._selectedIds.add(item.id));
		} else {
			this._selectedIds.add(items.id);
		}
	}

	/**
	 * Removes the given item from the selection set. Doesn't check if it was actually selected or not.
	 * @param item The item to be deselected.
	 */
	deselect(item: FSAItem): void {
		this._selectedIds.delete(item.id);
	}

	/**
	 * Checks wether the given item is currently selected.
	 * @param item The item to check.
	 * @returns True if selected, false otherwise.
	 */
	isSelected(item: FSAItem): boolean {
		return this._selectedIds.has(item.id);
	}

	/**
	 * Completely clears current selection.
	 */
	clearSelection(): void {
		this._selectedIds.clear();
	}

	/**
	 * Deletes all selected items.
	 */
	deleteSelectedItems(): void {
		this.selectedItems.forEach((item: FSAItem) => {
			this._fsaGraph.deleteItem(item);
		});
		this.clearSelection();
	}

	/**
	 * Simple getter for selection area.
	 */
	get selectionArea(): { start: Point; end: Point } | null {
		return this._selectionArea;
	}

	/**
	 * Updates the selection area, given a start and end point.
	 * @param start Start point
	 * @param end End point.
	 */
	updateSelectionArea(start: Point, end: Point): void {
		this._selectionArea = { start, end };

		const xMin = Math.min(start.x, end.x);
		const xMax = Math.max(start.x, end.x);
		const yMin = Math.min(start.y, end.y);
		const yMax = Math.max(start.y, end.y);

		this._inSelectionAreaIds.clear();
		// Naive O(n) approach, potential for optimisation
		this._fsaGraph.nodes.forEach((node) => {
			const pos = node.pos;
			if (pos.x >= xMin && pos.x <= xMax && pos.y >= yMin && pos.y <= yMax) {
				this._inSelectionAreaIds.add(node.id);
			}
		});
		// Naive O(n) approach, potential for optimisation
		this._fsaGraph.edges.forEach((edge) => {
			const pos = edge.controlPoint;
			if (pos.x >= xMin && pos.x <= xMax && pos.y >= yMin && pos.y <= yMax) {
				this._inSelectionAreaIds.add(edge.id);
			}
		});
	}

	/**
	 * Removes the selection area.
	 */
	destroySelectionArea(): void {
		this._selectionArea = null;
		this._inSelectionAreaIds.clear();
	}

	/**
	 * Checks wether the given item is in the selection area.
	 * @param item The item to check.
	 * @returns True if in selection area, false otherwise.
	 */
	isInSelectionArea(item: FSAItem): boolean {
		return this._inSelectionAreaIds.has(item.id);
	}

	/**
	 * Commits the current selection area to the selected items set.
	 * @param append Flag indicating wether to append to current selection or not
	 * (true = add to current selection, false = clear selection first, then select only items in selection area)
	 */
	commitSelectionArea(append: boolean = false): void {
		if (!append) {
			this.clearSelection();
		}
		this.inSelectionAreaItems.forEach((item) => {
			this._selectedIds.add(item.id);
		});
		this.destroySelectionArea();
	}
}
