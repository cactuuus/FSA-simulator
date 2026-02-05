import type { Point } from '$lib/utils/geometry';
import type { Serializable } from '$lib/utils/serialization';

/**
 * Serialized representation of the Viewport state.
 */
export type SerializedViewport = {
	panOffset: Point;
	zoomOffset: number;
};

/**
 * Manages the viewport (aka the portion of the area visible by the user) of the SVG element, including panning and zooming functionalities.
 * Also provides serialization methods to save and restore viewport state.
 */
export class Viewport implements Serializable<SerializedViewport> {
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

	get panOffset(): Point {
		return this._panOffset;
	}

	get zoomLevel(): number {
		return this._zoomLevel;
	}

	/**
	 * Returns the zoom level as a pretty string (for example, "100%").
	 */
	get prettyZoomLevel(): string {
		return (this._zoomLevel * 100).toFixed(0) + '%';
	}

	/**
	 * Resets the viewport to the default pan and zoom values.
	 */
	reset(): void {
		this._panOffset = { x: 0, y: 0 };
		this._zoomLevel = 1;
	}

	/**
	 * Pans the canvas by a given amount, adjusted for the current zoom level.
	 * @param delta The amount to pan the canvas by, in term of x and y.
	 */
	panBy(deltaX: number, deltaY: number): void {
		this._panOffset.x -= deltaX / this._zoomLevel;
		this._panOffset.y -= deltaY / this._zoomLevel;
	}

	/**
	 * Zooms in on the canvas, optionally towards a specific point.
	 * @param towardsPoint The point towards which to zoom in.
	 */
	zoomIn(towardsPoint?: Point): void {
		this.adjustZoom(this.ZOOM_STEP, towardsPoint);
	}

	/**
	 * Zooms in on the canvas, optionally towards a specific point.
	 * @param towardsPoint The point towards which to zoom out.
	 */
	zoomOut(towardsPoint?: Point): void {
		this.adjustZoom(-this.ZOOM_STEP, towardsPoint);
	}

	/**
	 * Private method to adjust the zoom level, clamped between MIN_ZOOM and MAX_ZOOM.
	 * @param difference The amount to adjust the zoom level by.
	 * @param towardsPoint The point towards which to adjust the zoom. If not provided, defaults to the center of the canvas.
	 */
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

	/**
	 * Serializes the current viewport state to a JSON object.
	 * @returns A JSON object representing the current viewport state.
	 */
	toJSON(): SerializedViewport {
		return {
			panOffset: this._panOffset,
			zoomOffset: this._zoomLevel
		};
	}

	/**
	 * Restores the viewport state from a JSON object.
	 * @param json A JSON object representing the viewport state.
	 */
	loadFromJSON(json: SerializedViewport): void {
		this._panOffset = json.panOffset ?? { x: 0, y: 0 };
		this._zoomLevel = json.zoomOffset ?? 1;
	}
}
