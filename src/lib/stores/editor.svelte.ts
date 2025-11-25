import { type Point, Node, Edge, DraftEdge, FSAGraph, type FSAItem } from '$lib/fsa';
import { StateManager } from '$lib/state-machine';

class EditorManager {
	#fsaGraph = new FSAGraph();
	#stateManager: StateManager = new StateManager();
	#selectedItemId = $state<string | null>(null);
	#draftEdge = $state<DraftEdge | null>(null);
	selectedItem = $derived(
		this.#selectedItemId ? this.#fsaGraph.getItemFromId(this.#selectedItemId) : null
	);

	// canvas
	CANVAS_ZOOM_STEP = 0.1;
	#CANVAS_MIN_ZOOM = 0.5;
	#CANVAS_MAX_ZOOM = 2;
	#panOffset = $state<Point>({ x: 0, y: 0 });
	#zoomLevel = $state<number>(1);
	#canvasSize = $state<{ width: number; height: number }>({ width: 1000, height: 1000 });
	#viewBox = $derived(
		`${this.#panOffset.x} ${this.#panOffset.y}
		${this.#canvasSize.width / this.#zoomLevel} ${this.#canvasSize.height / this.#zoomLevel}`
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

	panCanvas(delta: Point): void {
		this.#panOffset.x -= delta.x / this.zoomLevel;
		this.#panOffset.y -= delta.y / this.zoomLevel;
	}

	adjustZoom(difference: number, towardsPoint?: Point): void {
		// Default to center of canvas if no towardsPoint provided
		if (!towardsPoint) {
			towardsPoint = {
				x: this.#canvasSize.width / this.#zoomLevel / 2,
				y: this.#canvasSize.height / this.#zoomLevel / 2
			};
		}

		const oldZoom = this.#zoomLevel;
		this.#zoomLevel = Math.min(
			Math.max(this.#zoomLevel + difference, this.#CANVAS_MIN_ZOOM),
			this.#CANVAS_MAX_ZOOM
		); // Clamp between MIN and MAX values

		const xAdjustment = towardsPoint.x * (1 / oldZoom - 1 / this.#zoomLevel);
		const yAdjustment = towardsPoint.y * (1 / oldZoom - 1 / this.#zoomLevel);

		this.#panOffset.x += xAdjustment;
		this.#panOffset.y += yAdjustment;

		// // Adjust panOffset to keep canvas centered around towardsPoint
		// this.#panOffset.x -= towardsPoint.x * -difference;
		// this.#panOffset.y -= towardsPoint.y * -difference;
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

	get panOffset(): Point {
		return this.#panOffset;
	}

	get zoomLevel(): number {
		return this.#zoomLevel;
	}

	get prettyZoomLevel(): string {
		return (this.#zoomLevel * 100).toFixed(0) + '%';
	}

	get viewBox(): string {
		return this.#viewBox;
	}

	get canvasSize(): { width: number; height: number } {
		return this.#canvasSize;
	}

	set canvasSize(size: { width: number; height: number }) {
		this.#canvasSize = size;
	}
}

export const editor = new EditorManager();
