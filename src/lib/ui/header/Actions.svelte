<script lang="ts">
	import {
		Folder,
		Download,
		ChevronDown,
		Loader,
		TriangleAlert,
		Info,
		Layers,
		X,
		ImageDown
	} from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { notifyError, notifySuccess, notifyWarning } from '$lib/utils/notifications';
	import { cleanAndSerializeSvgGraph } from '$lib/automata/visuals';

	let clearFsaModal: HTMLDialogElement;
	let togglePdaModal: HTMLDialogElement;
	let pendingPdaState = $state<boolean>(false); // used instead of a direct bind to avoid rsponsiveness issues with UI

	/**
	 * Opens the system's file dialog to select a .json file to upload.
	 */
	function openFileDialog() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.fsa';
		input.multiple = false;
		input.onchange = () => handleGraphUpload(input.files);
		input.click();
	}

	/**
	 * Handles the graph upload process. If any error occurs during the upload, the previous graph state is restored.
	 * @param files The list of files selected by the user (should be only one).
	 */
	async function handleGraphUpload(files: FileList | null) {
		if (!files || files.length === 0) {
			notifyError('No file selected.');
			return;
		}
		if (files.length > 1) {
			notifyError('Please select only one file.');
			return;
		}
		const file = files[0];
		if (!file.name.endsWith('.fsa')) {
			notifyError("Invalid file type, select a '.fsa' file.");
			return;
		}
		const backup = app.fsaGraph.toJSON();
		try {
			const text = await file.text();
			const json = JSON.parse(text);
			app.fsaGraph.loadFromJSON(json);
			notifySuccess('Graph imported & loaded successfully.');
		} catch (error: unknown) {
			app.fsaGraph.loadFromJSON(backup);
			console.error('Failed to import graph:', error);
			notifyError(
				'Failed to import graph. The file may be corrupted or from an incompatible version.'
			);
		}
	}

	/**
	 * Downloads the current graph to disk.
	 */
	async function downloadGraph() {
		if (app.fsaGraph.isEmpty) {
			notifyWarning('The graph is empty, nothing to download.');
			return;
		}
		try {
			const filename = `${app.fsaGraph.title}.fsa`;
			const data = JSON.stringify(app.fsaGraph.toJSON());
			const blob = new Blob([data], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
			notifySuccess('Your graph download should have started, check your downloads folder.');
		} catch (error: unknown) {
			console.error('Failed to download graph:', error);
			notifyError('Failed to download graph, an unexpected error occurred. Please try again.');
		}
	}

	/**
	 * Clears the current FSA graph then closes the confirmation dialog.
	 * @param e The submit event from the confirmation form.
	 */
	async function clearFsa(e: SubmitEvent) {
		try {
			e.preventDefault();
			app.resetSession();
			clearFsaModal.close();
		} catch (error: unknown) {
			console.error('Failed to clear graph:', error);
			notifyError('Failed to clear graph, an unexpected error occurred. Please try again.');
		}
	}

	/**
	 * Exports the current FSA graph as an SVG file and triggers a download.
	 *
	 * POTENTIAL FOR IMPROVEMENT: Right now, styles for exporting are hardcoded, and the download is triggered immediately. We could use a more dynamic approach, like:
	 * - show a modal to let the user customise the SVG styling (maybe even the format?)
	 * - show a preview of the SVG before downloading.
	 */
	async function exportAsSvg() {
		if (app.fsaGraph.isEmpty) {
			notifyWarning('The graph is empty, nothing to download.');
			return;
		}
		try {
			const rawSvg = document.getElementById('drawing-board') as SVGSVGElement | null;
			const serialisedSvgGraph = cleanAndSerializeSvgGraph(rawSvg!);
			const blob = new Blob([serialisedSvgGraph], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${app.fsaGraph.title}.svg`;
			a.click();
			URL.revokeObjectURL(url);
			notifySuccess('Your SVG download should have started, check your downloads folder.');
		} catch (error: unknown) {
			console.error('Failed to export SVG:', error);
			notifyError('Failed to export SVG, an unexpected error occurred. Please try again.');
		}
	}

	/**
	 * Handles the PDA mode toggle process by showing a confirmation modal.
	 */
	function openTogglePdaModal() {
		pendingPdaState = !app.fsaGraph.hasStackOps;
		togglePdaModal.showModal();
	}

	/**
	 * Carries out the PDA toggle action then closes the confirmation modal.
	 * @param e The submit event from the confirmation form.
	 */
	function togglePda(e: SubmitEvent) {
		e.preventDefault();
		app.fsaGraph.hasStackOps = pendingPdaState;
		togglePdaModal.close();
	}
</script>

<!-- File menu -->
<div class="dropdown dropdown-start">
	<button tabindex="0" class="flex items-center gap-0.5 px-2 hover:text-secondary">
		File <ChevronDown class="h-4 w-4" />
	</button>
	<ul tabindex="-1" class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm">
		<li>
			<button onclick={() => clearFsaModal.showModal()}>
				<Loader class="h-4 w-4" /> New
			</button>
		</li>
		<li>
			<button onclick={openFileDialog}>
				<Folder class="h-4 w-4" /> Open
			</button>
		</li>
		<li>
			<button onclick={downloadGraph}>
				<Download class="h-4 w-4" /> Save to disk
			</button>
		</li>
		<li>
			<button onclick={exportAsSvg}>
				<ImageDown class="h-4 w-4" /> Export as SVG
			</button>
		</li>
	</ul>
</div>

<!-- FSA graph menu -->
<div class="dropdown dropdown-start">
	<button tabindex="0" class="flex items-center gap-0.5 px-2 hover:text-secondary">
		FSA <ChevronDown class="h-4 w-4" />
	</button>
	<ul tabindex="-1" class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm">
		<li>
			<button onclick={() => openTogglePdaModal()}>
				{#if app.fsaGraph.hasStackOps}
					<X class="h-4 w-4" /> Disable PDA mode
				{:else}
					<Layers class="h-4 w-4" /> Enable PDA mode
				{/if}
			</button>
		</li>
	</ul>
</div>

<!-- Clear FSA confirmation modal -->
<dialog id="confirm-clear-fsa-modal" bind:this={clearFsaModal} class="modal">
	<div class="modal-box">
		<h3 class="flex items-center gap-2 text-lg font-bold text-error">
			<TriangleAlert class="h-5 w-5" />
			<span>Warning</span>
		</h3>
		<p class="pt-4">
			Creating a new FSA graph will clear the current graph. Make sure to save the current FSA to
			disk if you don't want to lose your work.
		</p>
		<div class="modal-action mt-4">
			<form class="w-full" onsubmit={clearFsa}>
				<div class="flex justify-end gap-4">
					<button type="button" class="btn" onclick={() => clearFsaModal.close()}> Cancel </button>
					<button type="submit" class="btn btn-error">Confirm</button>
				</div>
			</form>
		</div>
	</div>
</dialog>

<!-- Toggle PDA on/off confirmation modal -->
<dialog id="confirm-toggle-pda-modal" bind:this={togglePdaModal} class="modal">
	<div class="modal-box">
		{#if pendingPdaState}
			<!-- Enabling PDA -->
			<h3 class="flex items-center gap-2 text-lg font-bold text-info">
				<Info class="h-5 w-5" />
				<span>Enable PDA Mode</span>
			</h3>
			<p class="pt-4">
				This will turn your FSA into a PDA (Push Down Automaton), enabling stack operations (pop &
				push) for all transitions.
				<br />
				You can always revert this change later, by disabling PDA mode.
			</p>
		{:else}
			<!-- Disabling PDA -->
			<h3 class="flex items-center gap-2 text-lg font-bold text-error">
				<TriangleAlert class="h-5 w-5" />
				<span>Disable PDA Mode</span>
			</h3>
			<p class="pt-4">
				This will remove all stack operations (pop & push) from all transitions.
				<br />
				<strong>
					Note that even re-enabling PDA later will not restore their current symbols!
				</strong>
			</p>
		{/if}
		<div class="modal-action mt-4">
			<form class="w-full" onsubmit={togglePda}>
				<div class="flex justify-end gap-4">
					<button type="button" class="btn" onclick={() => togglePdaModal.close()}> Cancel </button>
					<button type="submit" class="btn {pendingPdaState ? 'btn-info' : 'btn-error'}">
						Confirm
					</button>
				</div>
			</form>
		</div>
	</div>
</dialog>
