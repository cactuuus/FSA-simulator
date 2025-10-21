class CanvasStyle {
	nodeStroke = 'black';
	nodeText = 'black';
	selectedStroke = 'blue';
	draftStroke = 'orange';
	edgeStroke = 'black';

	loadFromCSS() {
		const styles = getComputedStyle(document.documentElement);

		const cssNames = {
			nodeStroke: '--canvas-node-stroke',
			nodeText: '--canvas-node-text',
			selectedStroke: '--canvas-selected-stroke',
			draftStroke: '--canvas-draft-stroke',
			edgeStroke: '--canvas-edge-stroke'
		} as const;

		for (const [key, cssVar] of Object.entries(cssNames) as [keyof typeof cssNames, string][]) {
			const value = styles.getPropertyValue(cssVar).trim();
			if (value) {
				this[key] = value;
			}
		}
	}
}

export const canvasStyle = new CanvasStyle();
