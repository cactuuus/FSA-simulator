/**
 * Geometric constants for graph elements.
 * These values are used for calculations and should not change.
 */
export const GRAPH_GEOMETRY = {
	nodeRadius: 30,
	acceptingNodeRadius: 25,
	loopbackArcSize: 40,
	labelLineHeight: 20,
	bezierLabelDistanceBias: 0.3, // value between 0 and 1
	loopbackLabelOffset: 110, // accounting for loopback arc size & node radius
	edgeStartOffset: 34, // accounting for node radius
	edgeEndOffset: 36, // accounting for node radius + arrow offset
	arrowSize: 4
} as const;

/**
 * Default appearance settings for the graph.
 */
const DEFAULT_APPEARANCE = {
	textSize: 16,
	strokeWidth: 2,
	textWeight: 'bold',
	haloThickness: 5,
	haloOpacity: 0.8
};

export type GraphAppearance = typeof DEFAULT_APPEARANCE;

/**
 * Color modes for different contexts.
 * - themed: Uses CSS variables for theme-aware rendering
 * - light: Hardcoded light theme (for exports)
 */
const COLOR_MODES = {
	themed: {
		bgColor: 'var(--board-bg-color)',
		drawColor: 'var(--draw-color)'
	},
	light: {
		bgColor: 'white',
		drawColor: 'black'
	},
	dark: {
		bgColor: 'black',
		drawColor: 'white'
	}
} as const;

export type ColorMode = keyof typeof COLOR_MODES;

/**
 * Generates CSS styles for the graph.
 * @param colorMode - The color mode to use (themed, light, or dark)
 * @param overrides - Optional appearance overrides
 * @returns CSS string ready to be injected into a <style> tag
 */
export function getGraphCSS(
	colorMode: ColorMode,
	overrides: Partial<GraphAppearance> = {}
): string {
	const colors = COLOR_MODES[colorMode];
	const style = { ...DEFAULT_APPEARANCE, ...overrides };
	return `
    #drawing-board {
		background-color: ${colors.bgColor};
    }
    .node {
		fill: ${colors.bgColor};
		fill-opacity: ${style.haloOpacity};
		color: ${colors.drawColor};
		stroke: ${colors.drawColor};
		stroke-width: ${style.strokeWidth}px;
    }
    .edge {
		fill: none;
		color: ${colors.drawColor};
		stroke: ${colors.drawColor};
		stroke-width: ${style.strokeWidth}px;
    }
    .node .accepting-circle {
		fill: none;
		stroke-width: ${style.strokeWidth}px;
    }
    .node .node-label,
    .edge .edge-label {
		paint-order: stroke fill;
		stroke-linejoin: round;
		stroke: ${colors.bgColor};
		stroke-width: ${style.haloThickness}px;
		stroke-opacity: ${style.haloOpacity};
		fill: ${colors.drawColor};
		font-weight: ${style.textWeight};
		font-size: ${style.textSize}px;
		text-anchor: middle;
    }
    .halo-stroke {
		fill: none;
		stroke: ${colors.bgColor};
		stroke-opacity: ${style.haloOpacity};
		stroke-width: ${style.haloThickness}px;
    }
  `.trim();
}
