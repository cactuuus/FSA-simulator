import { browser } from '$app/environment';
import type { Point } from '$lib/geometry';

// constants
export const CANVAS_ZOOM_STEP = 0.1;
export const CANVAS_MIN_ZOOM = 0.5;
export const CANVAS_MAX_ZOOM = 2;

let panOffset = $state<Point>({ x: 0, y: 0 });
let zoomLevel = $state<number>(1);
let canvasSize = $state<{ width: number; height: number }>({ width: 1000, height: 1000 });
const viewBox = $derived(
	`${panOffset.x} ${panOffset.y} ${canvasSize.width / zoomLevel} ${canvasSize.height / zoomLevel}`
);

export const viewport = {
	// getters & setters

	get zoomLevel(): number {
		return zoomLevel;
	},

	get prettyZoomLevel(): string {
		return (zoomLevel * 100).toFixed(0) + '%';
	},

	get viewBox(): string {
		return viewBox;
	},

	get canvasSize(): { width: number; height: number } {
		return canvasSize;
	},

	set canvasSize(size: { width: number; height: number }) {
		canvasSize = size;
	},

	get panOffset(): Point {
		return panOffset;
	},

	reset(): void {
		panOffset = { x: 0, y: 0 };
		zoomLevel = 1;
	},

	// actions

	panCanvas(delta: { x: number; y: number }): void {
		panOffset.x -= delta.x / zoomLevel;
		panOffset.y -= delta.y / zoomLevel;
	},

	adjustZoom(difference: number, towardsPoint?: Point): void {
		// Default to center of canvas if no towardsPoint provided
		if (!towardsPoint) {
			towardsPoint = {
				x: canvasSize.width / zoomLevel / 2,
				y: canvasSize.height / zoomLevel / 2
			};
		}
		const oldZoom = zoomLevel;
		zoomLevel = Math.min(Math.max(zoomLevel + difference, CANVAS_MIN_ZOOM), CANVAS_MAX_ZOOM); // Clamp between MIN and MAX values
		const xAdjustment = towardsPoint.x * (1 / oldZoom - 1 / zoomLevel);
		const yAdjustment = towardsPoint.y * (1 / oldZoom - 1 / zoomLevel);
		panOffset.x += xAdjustment;
		panOffset.y += yAdjustment;
	},

	// serialisation

	toJson(): { pan: Point; zoom: number } {
		return { pan: { x: panOffset.x, y: panOffset.y }, zoom: zoomLevel };
	},

	fromJson(json: { pan: Point; zoom: number }): void {
		panOffset = json.pan;
		zoomLevel = json.zoom;
	}
};

export function saveViewport(): void {
	if (!browser) return;
	try {
		localStorage.setItem('viewport-state', JSON.stringify(viewport.toJson()));
	} catch (error) {
		console.error('Failed to write to localStorage:', error);
	}
}

export function loadViewport(): void {
	if (!browser) return;
	const saved = localStorage.getItem('viewport-state');
	if (saved) viewport.fromJson(JSON.parse(saved));
}

export function resetViewport(): void {
	if (!browser) return;
	viewport.reset();
	localStorage.removeItem('viewport-state');
}
