/**
 * Styles used for exported SVG graphs.
 * They are hardcoded here for simplicity, but could be made dynamic in the future.
 */
const exportStyles = {
	boardBgColor: 'white',
	drawColor: 'black',
	textSize: '16px',
	textWeight: 'bold',
	textHaloWidth: '5px',
	textHaloOpacity: '0.85',
	graphStrokeWidth: '2px',
	padding: 20
};

/**
 * Cleans and serializes an SVG graph element for export.
 * It works on a clone of the original SVG to avoid modifying it, but needs the original to read current dimensions.
 * @param original The original SVG element containing the graph.
 * @returns Serialized SVG data in string format.
 */
export function cleanAndSerializeSvgGraph(original: SVGSVGElement): string {
	const clone = original.cloneNode(true) as SVGSVGElement;
	cleanFromUnnecessaryElements(clone);
	matchViewBox(clone, original);
	addEmbeddedStyling(clone);
	const serializer = new XMLSerializer();
	const svgString = serializer.serializeToString(clone);
	return svgString;
}

/**
 * Matches the viewBox of the cloned SVG to the bounding box of the graph content in the original SVG.
 * @param clone The cloned SVG element to modify.
 * @param original The original SVG element to read dimensions from.
 */
function matchViewBox(clone: SVGSVGElement, original: SVGSVGElement): void {
	const originalGraphComponent = original?.querySelector('#fsa-graph') as SVGGElement | null;
	if (originalGraphComponent === null) throw new Error('Graph content not found in SVG');
	const boundingBox = originalGraphComponent.getBBox();
	clone.setAttribute(
		'viewBox',
		`${boundingBox.x - exportStyles.padding} ${boundingBox.y - exportStyles.padding}
         ${boundingBox.width + exportStyles.padding * 2} ${boundingBox.height + exportStyles.padding * 2}`
	);
}

/**
 * Removes elements from the cloned SVG that unnecessary and potentially problematic for the exported version.
 * @param clone The cloned SVG element to clean.
 */
function cleanFromUnnecessaryElements(clone: SVGSVGElement): void {
	// remove elements that are not part of the actual graph content
	const removableElements = ['#overlay-group', '.interaction-only'];
	clone.querySelectorAll(removableElements.join(',')).forEach((element) => element.remove());

	// remove styling classes used on the drawing board
	clone.removeAttribute('class');

	// POTENTIAL FOR IMPROVEMENT:
	// (This is not very important as we're talking about lightweight SVGs already, but still I reckon half of their content is probably redundant)
	// - unify arrow markers (defs element) to avoid duplicates. This requires updating all references accordingly.
	// - remove attributes (like data-ids) from all elements (must first fix the defs unification to avoid breaking references).
}

/**
 * Adds embedded styling to the cloned SVG for proper appearance when exported.
 * @param clone The cloned SVG element to modify.
 */
function addEmbeddedStyling(clone: SVGSVGElement): void {
	const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
	styleElement.textContent = `
    #drawing-board {
        background-color: ${exportStyles.boardBgColor};
    }
	.node {
        fill: ${exportStyles.boardBgColor};
		fill-opacity: ${exportStyles.textHaloOpacity};
        color: ${exportStyles.drawColor};
        stroke: ${exportStyles.drawColor};
        stroke-width: ${exportStyles.graphStrokeWidth};
	}
    .edge {
        fill: transparent;
        color: ${exportStyles.drawColor};
        stroke: ${exportStyles.drawColor};
        stroke-width: ${exportStyles.graphStrokeWidth};
    }
	node .accepting-circle {
		fill: none;
		stroke-width: calc(${exportStyles.graphStrokeWidth});
	}
    .node .node-label, .edge .edge-label {
        paint-order: stroke fill;
        stroke-linejoin: round;
        stroke: ${exportStyles.boardBgColor};
        stroke-width: ${exportStyles.textHaloWidth};
        stroke-opacity: ${exportStyles.textHaloOpacity};
        fill: ${exportStyles.drawColor};
        font-weight: ${exportStyles.textWeight};
        font-size: ${exportStyles.textSize};
        text-anchor: middle;
    }
    marker path {
        fill: ${exportStyles.drawColor};
    }
	.halo-stroke {
		fill: none;
		stroke: ${exportStyles.boardBgColor};
		stroke-opacity: ${exportStyles.textHaloOpacity};
		stroke-width: calc(${exportStyles.graphStrokeWidth} * 3);
	}
    `.trim();
	clone.prepend(styleElement);
}
