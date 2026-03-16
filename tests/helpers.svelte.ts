/**
 * Allows running a test with a reactive context (like a $derived rune).
 * @param testFunction The test function to run
 */
export function withReactivity(testFunction: () => void) {
	const cleanup = $effect.root(testFunction);
	cleanup();
}
