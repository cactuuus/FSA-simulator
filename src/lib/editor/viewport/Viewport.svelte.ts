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
	readonly MIN_ZOOM: number = 0.1;
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
	 * Pans the canvas to center on the given point(s), adjusted for the current zoom level.
	 * @param points The point(s) to center on.
	 */
	panTo(...points: Point[]): void {
		if (points.length === 0) return;
		const centerX = (Math.min(...points.map((p) => p.x)) + Math.max(...points.map((p) => p.x))) / 2;
		const centerY = (Math.min(...points.map((p) => p.y)) + Math.max(...points.map((p) => p.y))) / 2;
		this._panOffset.x = centerX - this.canvasSize.width / (2 * this._zoomLevel);
		this._panOffset.y = centerY - this.canvasSize.height / (2 * this._zoomLevel);
	}

	/**
	 * Zooms in on the canvas, optionally towards a specific point.
	 * @param towardsPoint The point towards which to zoom in.
	 */
	zoomIn(towardsPoint?: Point): void {
		this.adjustZoom(this.ZOOM_STEP, towardsPoint);
	}

	/**
	 * Zooms out on the canvas, optionally towards a specific point.
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
		const oldZoom = this._zoomLevel;
		// Clamp between MIN and MAX values
		this._zoomLevel = Math.min(Math.max(oldZoom + difference, this.MIN_ZOOM), this.MAX_ZOOM);

		// Default to center of canvas if no towardsPoint provided
		if (!towardsPoint) {
			towardsPoint = {
				x: this._panOffset.x + this.canvasSize.width / (2 * oldZoom),
				y: this._panOffset.y + this.canvasSize.height / (2 * oldZoom)
			};
		}

		// Update panOffset to keep the towardsPoint stationary relative to the viewport
		const screenX = (towardsPoint.x - this._panOffset.x) * oldZoom;
		const screenY = (towardsPoint.y - this._panOffset.y) * oldZoom;
		this._panOffset.x = towardsPoint.x - screenX / this._zoomLevel;
		this._panOffset.y = towardsPoint.y - screenY / this._zoomLevel;
	}

	/**
	 * Converts a point from SVG coordinates to screen coordinates.
	 * Inverse of the transform applied by getPointerPosFromEvent.
	 * @param point The point in SVG coordinates to convert.
	 * @returns The point in canvas coordinates.
	 */
	svgToScreen(point: Point): Point {
		return {
			x: (point.x - this._panOffset.x) * this._zoomLevel,
			y: (point.y - this._panOffset.y) * this._zoomLevel
		};
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
