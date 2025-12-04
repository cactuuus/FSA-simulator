import { type Point, Node, Edge, DraftEdge, FSAGraph, type FSAItem } from '$lib/fsa';
import { StateManager } from '$lib/state-machine';
import { ViewportManager } from '$lib/UI/canvas';

class EditorManager {
	#fsaGraph = new FSAGraph();
	#stateManager: StateManager = new StateManager();
	#viewportManager: ViewportManager = new ViewportManager();
	#selectedItemId = $state<string | null>(null);
	#draftEdge = $state<DraftEdge | null>(null);
	selectedItem = $derived(
		this.#selectedItemId ? this.#fsaGraph.getItemFromId(this.#selectedItemId) : null
	);

	selectItem(item: FSAItem | null) {
		this.#selectedItemId = item?.id || null;
	}

	isSelected(item: FSAItem): boolean {
		return this.#selectedItemId === item.id;
	}

	clearSelection() {
		this.#selectedItemId = null;
	}

	deleteSelectedItem() {
		if (!this.selectedItem) {
			return;
		}
		this.#fsaGraph.deleteItem(this.selectedItem);
		this.clearSelection();
	}

	setDraftEdge(source: Node, target: Node) {
		const duplicateEdge = this.#fsaGraph.edgeAlreadyExists(source, target);
		this.#draftEdge = new DraftEdge(source, target, duplicateEdge);
	}

	updateDraftEdgeTarget(newTarget: Point | Node) {
		if (this.#draftEdge) {
			let duplicateEdge = false;
			if (newTarget instanceof Node) {
				duplicateEdge = this.#fsaGraph.edgeAlreadyExists(this.#draftEdge.from, newTarget);
			}
			this.#draftEdge.updateTarget(newTarget, duplicateEdge);
		}
	}

	commitDraftEdge(targetNode: Node): Edge | null {
		if (!this.#draftEdge) {
			throw new Error('No draft edge to commit');
		}
		if (this.#draftEdge.isDuplicate) {
			console.error('Cannot commit to a duplicate edge');
			return null;
		}

		return this.#fsaGraph.addEdge(this.#draftEdge.from, targetNode);
	}

	clearDraftEdge() {
		this.#draftEdge = null;
	}

	get draftEdge(): DraftEdge | null {
		return this.#draftEdge;
	}

	get fsaGraph(): FSAGraph {
		return this.#fsaGraph;
	}

	get stateManager(): StateManager {
		return this.#stateManager;
	}

	get viewportManager(): ViewportManager {
		return this.#viewportManager;
	}
}

export const editor = new EditorManager();
