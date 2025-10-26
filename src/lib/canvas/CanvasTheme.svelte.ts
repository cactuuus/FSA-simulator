/**
 * This script is use to pull canvas style variables from CSS into an object that can be accessed
 * from anywhere in the codebase. This allows to 'react' to changes in the CSS values, if ever
 * switches between light and dark themes.
 */

/**
 * Simple object storing the styles imported from CSS.
 * It is initialised with default values just in case one or more CSS variables are not defined.
 */
const style = {
	nodeStroke: { value: 'black', cssName: '--canvas-node-stroke' },
	nodeText: { value: 'black', cssName: '--canvas-node-text' },
	selectedStroke: { value: 'blue', cssName: '--canvas-selected-stroke' },
	draftStroke: { value: 'orange', cssName: '--canvas-draft-stroke' },
	edgeStroke: { value: 'black', cssName: '--canvas-edge-stroke' }
};

/**
 * Store indicating whether the current theme is light or dark.
 * This is mainly useful for components that need to react to theme changes.
 */
let colorScheme = $state('light' as 'light' | 'dark');

/**
 * Loads the canvas styles from CSS .
 */
function loadFromCSS() {
	const styles = getComputedStyle(document.documentElement);

	for (const property of Object.values(style)) {
		const cssValue = styles.getPropertyValue(property.cssName);
		if (cssValue) {
			property.value = cssValue;
		} else {
			console.warn(
				`CSS variable ${property.cssName} is not defined. Using its default/current value.`
			);
		}
	}

	colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Loads the canvas styles from CSS and sets up a listener to reload them whenever the user
 * switches between light and dark themes.
 */
function init() {
	loadFromCSS();
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', loadFromCSS);
}

/**
 * The exported store containing the canvas theme information. It exposes its content via
 * getters, as to prevent external modification.
 */
export const canvasTheme = {
	init,
	get colorScheme() {
		return colorScheme;
	},
	get styles() {
		return style;
	}
};
