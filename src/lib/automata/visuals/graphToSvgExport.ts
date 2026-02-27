import { getGraphCSS } from './graphConfig';
import { getGraphElement } from '$lib/utils/graphEffects';

/**
 * Cleans and serializes an SVG graph element for export.
 * It works on a clone of the original SVG to avoid modifying it, but needs the original to read current dimensions.
 * @param original The original SVG element containing the graph.
 * @returns Serialized SVG data in string format.
 */
export function cleanAndSerializeSvgGraph(original: SVGSVGElement): string {
	const defaultPadding = 20;
	const clone = original.cloneNode(true) as SVGSVGElement;
	cleanFromUnnecessaryElements(clone);
	matchViewBox(clone, original, defaultPadding);
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
function matchViewBox(clone: SVGSVGElement, original: SVGSVGElement, padding: number): void {
	const originalGraphComponent = getGraphElement();
	if (originalGraphComponent === null) throw new Error('Graph content not found in SVG');
	const boundingBox = originalGraphComponent.getBBox();
	clone.setAttribute(
		'viewBox',
		`${boundingBox.x - padding} ${boundingBox.y - padding}
         ${boundingBox.width + padding * 2} ${boundingBox.height + padding * 2}`
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
	styleElement.textContent = getGraphCSS('light');
	clone.prepend(styleElement);
}
