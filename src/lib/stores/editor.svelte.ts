import { type Point, Node, DraftEdge, FSAGraph, type FSAItem } from '$lib/fsa';
import { StateManager } from '$lib/state-machine';

class EditorManager {
	#fsaGraph = new FSAGraph();
	#stateManager: StateManager = new StateManager();
	#selectedItem = $state<FSAItem | null>(null);
	#draftEdge = $state<DraftEdge | null>(null);

	selectItem(item: FSAItem | null) {
		this.#selectedItem = item;
	}

	isSelected(item: FSAItem): boolean {
		return this.#selectedItem?.id === item.id;
	}

	clearSelection() {
		this.#selectedItem = null;
	}

	setDraftEdge(source: Node, target: Point) {
		this.#draftEdge = new DraftEdge(source, target);
	}

	updateDraftEdgeTarget(newTarget: Point | Node) {
		if (this.#draftEdge) {
			this.#draftEdge.updateTarget(newTarget);
		}
	}

	commitDraftEdge(targetNode: Node) {
		if (this.#draftEdge) {
			this.#fsaGraph.addEdge(this.#draftEdge.from, targetNode);
		}
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
	get selectedItem(): FSAItem | null {
		return this.#selectedItem;
	}
}

export const editor = new EditorManager();
