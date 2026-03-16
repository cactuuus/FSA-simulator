let graph: SVGGElement | null = null;

export function setGraphElement(element: SVGGElement): void {
	graph = element;
}

export function getGraphElement(): SVGGElement | null {
	return graph;
}

/**
 * Toggle a class on an element in the graph based on its id.
 * @param state Whether to add or remove the class.
 * @param className The class name to toggle.
 * @param ids The data-ids of the elements to target.
 */
export function toggleClass(state: boolean, className: string, ...ids: string[]): void {
	ids.forEach((id) => {
		graph?.querySelector(`[data-id="${id}"]`)?.classList.toggle(className, state);
	});
}

/**
 * A specialized version of toggleClass to toggle the 'highlighted' class on graph elements.
 * @param state Whether to add or remove the 'highlighted' class.
 * @param ids The data-ids of the elements to target.
 */
export function toggleHighlight(state: boolean, ...ids: string[]): void {
	toggleClass(state, 'highlighted', ...ids);
}

/**
 * A specialized version of toggleClass to toggle the 'selected' class on graph elements.
 * @param state Whether to add or remove the 'selected' class.
 * @param ids The data-ids of the elements to target.
 */
export function toggleSelected(state: boolean, ...ids: string[]): void {
	toggleClass(state, 'selected', ...ids);
}

/**
 * A specialized version of toggleClass to toggle the 'in-selection-area' class on graph elements.
 * @param state Whether to add or remove the 'in-selection-area' class.
 * @param ids The data-ids of the elements to target.
 */
export function toggleInSelectionArea(state: boolean, ...ids: string[]): void {
	toggleClass(state, 'in-selection-area', ...ids);
}

export function toggleActive(state: boolean, ...ids: string[]): void {
	toggleClass(state, 'active', ...ids);
}

export function toggleInvalid(state: boolean, ...ids: string[]): void {
	toggleClass(state, 'invalid', ...ids);
}

export function toggleAccepted(state: boolean, ...ids: string[]): void {
	toggleClass(state, 'input-accepted', ...ids);
}
