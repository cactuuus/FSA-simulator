/**
 * Helper function to 'teleport' an HTML element to the body.
 * Useful for dialogs/popups that should always be rendered as full-paged items.
 */
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
}
