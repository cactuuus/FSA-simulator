<script lang="ts">
	import {
		Loader,
		FolderOpen,
		FolderOpenDot,
		Download,
		ImageDown,
		FileBraces
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { app } from '$lib/stores/app.svelte';
	import type { SerializedFSAGraph } from '$lib/automata-models';
	import { notifyError, notifySuccess, notifyWarning } from '$lib/utils/notifications';
	import { cleanAndSerializeSvgGraph, graphToTikz } from '$lib/exporting';
	import { LoadGraphCommand } from '$lib/editor/commands';
	import { portal } from '$lib/utils/portal';

	/**
	 * Used to display FSA examples. This structure needs to match the one in 'static/examples/manifest.json'.
	 */
	interface Example {
		filename: string;
		type: string;
		language: string;
		description: string;
	}

	let clearFsaModal: HTMLDialogElement;
	let loadExampleModal: HTMLDialogElement;
	let availableExamples = $state<Example[]>([]);
	let fetchingExamples = $state(true);

	function openFileDialog() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.fsa';
		input.onchange = () => handleGraphUpload(input.files);
		input.click();
	}

	async function handleGraphUpload(files: FileList | null) {
		if (!files?.length) {
			notifyError('No file selected.');
			return;
		}
		const file = files[0];
		if (!file.name.endsWith('.fsa')) {
			notifyError("Select a '.fsa' file.");
			return;
		}
		loadFsaFromJSON(JSON.parse(await file.text()));
	}

	function loadFsaFromJSON(json: SerializedFSAGraph) {
		const backup = app.fsaGraph.toJSON();
		try {
			app.desiredAlphabet.reset();
			app.commandHistory.pushAndExecute(new LoadGraphCommand(json));
			notifySuccess('Graph loaded successfully.');
		} catch (err) {
			// restore grpah directly, without pushing to command history, to avoid messing up the undo stack
			app.fsaGraph.loadFromJSON(backup);
			console.error(err);
			notifyError('Failed to load graph. The file may be corrupted.');
		}
	}

	async function downloadGraph() {
		if (app.fsaGraph.isEmpty) {
			notifyWarning('The graph is empty, nothing to download.');
			return;
		}
		try {
			const blob = new Blob([JSON.stringify(app.fsaGraph.toJSON())], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = Object.assign(document.createElement('a'), {
				href: url,
				download: `${app.fsaGraph.title}.fsa`
			});
			a.click();
			URL.revokeObjectURL(url);
			notifySuccess('Download started.');
		} catch (err) {
			console.error(err);
			notifyError('Failed to download graph.');
		}
	}

	async function exportAsSvg() {
		if (app.fsaGraph.isEmpty) {
			notifyWarning('The graph is empty, nothing to export.');
			return;
		}
		try {
			const rawSvg = document.getElementById('drawing-board') as SVGSVGElement | null;
			const blob = new Blob([cleanAndSerializeSvgGraph(rawSvg!)], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);
			const a = Object.assign(document.createElement('a'), {
				href: url,
				download: `${app.fsaGraph.title}.svg`
			});
			a.click();
			URL.revokeObjectURL(url);
			notifySuccess('SVG download started.');
		} catch (err) {
			console.error(err);
			notifyError('Failed to export SVG.');
		}
	}

	function exportAsTikz() {
		if (app.fsaGraph.isEmpty) {
			notifyWarning('The graph is empty, nothing to export.');
			return;
		}
		try {
			navigator.clipboard.writeText(graphToTikz(app.fsaGraph));
			notifySuccess('TikZ code copied to clipboard.');
		} catch (err) {
			console.error(err);
			notifyError('Failed to export TikZ.');
		}
	}

	async function fetchExamples() {
		fetchingExamples = true;
		availableExamples = await fetch('/examples/manifest.json')
			.then((r) => r.json())
			.catch((err) => {
				console.error(err);
				notifyError('Failed to load examples.');
				return [];
			})
			.finally(() => (fetchingExamples = false));
	}

	onMount(() => fetchExamples());
</script>

<h2 class="menu-title">File</h2>
<ul>
	<li>
		<button onclick={() => clearFsaModal.showModal()}>
			<Loader class="h-4 w-4" /> New
		</button>
	</li>
	<li>
		<button onclick={openFileDialog}>
			<FolderOpen class="h-4 w-4" /> Open
		</button>
	</li>
	<li>
		<button onclick={() => loadExampleModal.showModal()}>
			<FolderOpenDot class="h-4 w-4" /> Browse examples
		</button>
	</li>
	<li>
		<button onclick={downloadGraph}>
			<Download class="h-4 w-4" /> Save to disk
		</button>
	</li>
	<li>
		<button onclick={exportAsSvg}>
			<ImageDown class="h-4 w-4" /> Export SVG
		</button>
	</li>
	<li>
		<button onclick={exportAsTikz}>
			<FileBraces class="h-4 w-4" /> Export LaTeX (TikZ)
		</button>
	</li>
</ul>

<!-- Modals  -->

<dialog bind:this={clearFsaModal} class="modal" use:portal>
	<div class="modal-box">
		<h3 class="text-lg font-bold text-error">Clear graph?</h3>
		<p class="pt-3 text-sm">
			This will clear the current graph. Save to disk first if you don't want to lose your work.
		</p>
		<div class="modal-action">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					app.resetSession();
					clearFsaModal.close();
				}}
			>
				<div class="flex gap-3">
					<button type="button" class="btn btn-sm" onclick={() => clearFsaModal.close()}
						>Cancel</button
					>
					<button type="submit" class="btn btn-sm btn-error">Clear</button>
				</div>
			</form>
		</div>
	</div>
</dialog>

<dialog bind:this={loadExampleModal} class="modal" use:portal>
	<div class="modal-box flex max-h-[80vh] max-w-2xl flex-col">
		<h3 class="mb-2 text-lg font-bold">Load Example</h3>
		<p class="mb-4 text-sm text-base-content/60">Select a pre-made FSA example.</p>
		{#if fetchingExamples}
			<div class="flex items-center justify-center gap-3 py-8 text-base-content/60">
				<span class="loading loading-spinner"></span> Loading...
			</div>
		{:else if availableExamples.length === 0}
			<div class="py-8 text-center text-base-content/60">No examples available.</div>
		{:else}
			<ul class="flex flex-col gap-1.5 overflow-y-auto">
				{#each availableExamples as example, i (i)}
					<li>
						<button
							type="button"
							class="btn flex h-auto w-full flex-col items-start p-2 text-left btn-soft"
							onclick={() => {
								fetch(`/examples/${example.filename}`)
									.then((r) => r.json())
									.then((json) => {
										loadFsaFromJSON(json);
										loadExampleModal.close();
									});
							}}
						>
							<span class="font-semibold">
								<span class="text-secondary">{example.type.toUpperCase()}</span>
								— {example.language}
							</span>
							<span class="text-xs text-base-content/60 italic">{example.description}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="modal-action mt-4">
			<button class="btn btn-sm" onclick={() => loadExampleModal.close()}>Close</button>
		</div>
	</div>
</dialog>
