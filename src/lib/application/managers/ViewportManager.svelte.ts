import type { Point } from '$lib/geometry';

export class ViewportManager {
	static readonly CANVAS_ZOOM_STEP = 0.1;
	static readonly CANVAS_MIN_ZOOM = 0.5;
	static readonly CANVAS_MAX_ZOOM = 2;

	#panOffset = $state<Point>({ x: 0, y: 0 });
	#zoomLevel = $state<number>(1);
	#canvasSize = $state<{ width: number; height: number }>({ width: 1000, height: 1000 });
	#viewBox = $derived(
		`${this.#panOffset.x} ${this.#panOffset.y}
        ${this.#canvasSize.width / this.#zoomLevel} ${this.#canvasSize.height / this.#zoomLevel}`
	);

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
			Math.max(this.#zoomLevel + difference, ViewportManager.CANVAS_MIN_ZOOM),
			ViewportManager.CANVAS_MAX_ZOOM
		); // Clamp between MIN and MAX values

		const xAdjustment = towardsPoint.x * (1 / oldZoom - 1 / this.#zoomLevel);
		const yAdjustment = towardsPoint.y * (1 / oldZoom - 1 / this.#zoomLevel);

		this.#panOffset.x += xAdjustment;
		this.#panOffset.y += yAdjustment;
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

	get panOffset(): Point {
		return this.#panOffset;
	}
}
