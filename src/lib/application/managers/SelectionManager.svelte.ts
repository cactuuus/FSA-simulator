import type { FSAGraph, FSAItem } from '$lib/automata/models';
import { SvelteSet } from 'svelte/reactivity';

export class SelectionManager {
	private _selectedIds = new SvelteSet<string>();
	private _fsaGraph: FSAGraph;

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
}
