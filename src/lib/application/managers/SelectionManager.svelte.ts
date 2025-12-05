import type { FSAGraph, FSAItem } from '$lib/automata/models';

export class SelectionManager {
	private _selectedItemId = $state<string | null>(null);
	private _fsaGraph: FSAGraph;

	constructor(fsaGraph: FSAGraph) {
		this._fsaGraph = fsaGraph;
	}

	get selectedItem(): FSAItem | null {
		return this._selectedItemId ? this._fsaGraph.getItemFromId(this._selectedItemId) : null;
	}

	selectItem(item: FSAItem | null) {
		this._selectedItemId = item?.id || null;
	}

	isSelected(item: FSAItem): boolean {
		return this._selectedItemId === item.id;
	}

	clearSelection() {
		this._selectedItemId = null;
	}

	deleteSelectedItem() {
		if (!this.selectedItem) {
			return;
		}
		this._fsaGraph.deleteItem(this.selectedItem);
		this.clearSelection();
	}
}
