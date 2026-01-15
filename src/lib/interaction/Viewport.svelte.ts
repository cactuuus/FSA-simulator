import type { Point } from '$lib/geometry/types';

export class Viewport {
	readonly ZOOM_STEP: number = 0.1;
	readonly MIN_ZOOM: number = 0.5;
	readonly MAX_ZOOM: number = 2;

	private _panOffset = $state<Point>({ x: 0, y: 0 });
	private _zoomLevel = $state<number>(1);
	canvasSize = $state<{ width: number; height: number }>({ width: 1000, height: 1000 });
	viewBox = $derived(
		`${this._panOffset.x} ${this._panOffset.y}
		 ${this.canvasSize.width / this._zoomLevel} ${this.canvasSize.height / this._zoomLevel}`
	);

	get zoomLevel(): number {
		return this._zoomLevel;
	}

	get prettyZoomLevel(): string {
		return (this._zoomLevel * 100).toFixed(0) + '%';
	}

	get panOffset(): Point {
		return this._panOffset;
	}

	// actions

	reset(): void {
		this._panOffset = { x: 0, y: 0 };
		this._zoomLevel = 1;
	}

	panCanvas(delta: { x: number; y: number }): void {
		this._panOffset.x -= delta.x / this._zoomLevel;
		this._panOffset.y -= delta.y / this._zoomLevel;
	}

	zoomIn(towardsPoint?: Point): void {
		this.adjustZoom(this.ZOOM_STEP, towardsPoint);
	}

	zoomOut(towardsPoint?: Point): void {
		this.adjustZoom(-this.ZOOM_STEP, towardsPoint);
	}

	private adjustZoom(difference: number, towardsPoint?: Point): void {
		// Default to center of canvas if no towardsPoint provided
		if (!towardsPoint) {
			towardsPoint = {
				x: this.canvasSize.width / this._zoomLevel / 2,
				y: this.canvasSize.height / this._zoomLevel / 2
			};
		}
		const oldZoom = this._zoomLevel;
		this._zoomLevel = Math.min(
			Math.max(this._zoomLevel + difference, this.MIN_ZOOM),
			this.MAX_ZOOM
		); // Clamp between MIN and MAX values
		const xAdjustment = towardsPoint.x * (1 / oldZoom - 1 / this._zoomLevel);
		const yAdjustment = towardsPoint.y * (1 / oldZoom - 1 / this._zoomLevel);
		this._panOffset.x += xAdjustment;
		this._panOffset.y += yAdjustment;
	}

	// serialisation -- useful for maintaining state across sessions

	toJSON(): { pan: Point; zoom: number } {
		return { pan: { x: this._panOffset.x, y: this._panOffset.y }, zoom: this._zoomLevel };
	}

	fromJSON(json: { pan: Point; zoom: number }): void {
		this._panOffset = json.pan;
		this._zoomLevel = json.zoom;
	}
}
