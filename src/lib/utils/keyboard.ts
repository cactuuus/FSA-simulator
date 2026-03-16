/**
 * Checks if the user is currently typing in an input field, textarea, select, or content-editable element.
 * Useful to prevent keyboard shortcuts from overriding these elements' default behavior.
 * @param event The keyboard event to check.
 * @returns True if the user is currently using one of the listed elements, false otherwise.
 */
export function isTyping(e: KeyboardEvent) {
	const target = e.target as HTMLElement;
	return (
		target.tagName === 'INPUT' ||
		target.tagName === 'TEXTAREA' ||
		target.tagName === 'SELECT' ||
		target.isContentEditable
	);
}
