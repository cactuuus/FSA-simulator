import { browser } from '$app/environment';
import { FSAGraph } from '$lib/automata/models';
import { UserFacingError } from '$lib/utils/errors';
import { notifyError, notifyWarning } from '$lib/utils/notifications.svelte';

/**
 * Singleton instance of the FSA graph, used app-wide.
 */
export const fsaGraph = new FSAGraph();

// Serialisation functions -- used for saving/loading the working graph

export function saveWorkingGraph(): void {
	if (!browser) return;
	try {
		localStorage.setItem('working-fsa', JSON.stringify(fsaGraph.toJSON()));
	} catch (error) {
		console.error('Failed to write to localStorage:', error);
	}
}

export function loadWorkingGraph(): void {
	if (!browser) return;
	const saved = localStorage.getItem('working-fsa');
	if (saved) fsaGraph.loadFromJSON(JSON.parse(saved));
}

export function clearWorkingGraph(): void {
	if (!browser) return;
	fsaGraph.clear();
	localStorage.removeItem('working-fsa');
}

export async function downloadWorkingGraph(): Promise<void> {
	if (fsaGraph.isEmpty) {
		throw new UserFacingError('Cannot download an empty graph.');
	}
	const filename = `${fsaGraph.title}.fsa`;
	const data = JSON.stringify(fsaGraph.toJSON());
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();

	URL.revokeObjectURL(url);
}

export async function uploadWorkingGraph(file: File): Promise<void> {
	const text = await file.text();
	const json = JSON.parse(text);
	const backup = fsaGraph.toJSON();
	try {
		fsaGraph.loadFromJSON(json);
	} catch (error: unknown) {
		fsaGraph.loadFromJSON(backup);
		notifyError(error);
		notifyWarning('Invalid FSA data in the uploaded file, upload aborted.');
	}
}
