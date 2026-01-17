<script lang="ts">
	import { Folder, Download, ChevronDown, Loader, TriangleAlert } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { notifyError, notifySuccess } from '$lib/utils/notifications';

	let confirmClearFsaModal: HTMLDialogElement;

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
	 *
	 */
	async function downloadGraph() {
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
	async function confirmClearGraph(e: SubmitEvent) {
		try {
			e.preventDefault();
			app.resetSession();
			confirmClearFsaModal.close();
		} catch (error: unknown) {
			console.error('Failed to clear graph:', error);
			notifyError('Failed to clear graph, an unexpected error occurred. Please try again.');
		}
	}
</script>

<div class="dropdown dropdown-start">
	<button tabindex="0" class="flex items-center gap-0.5 hover:text-secondary">
		File <ChevronDown class="h-4 w-4" />
	</button>
	<ul tabindex="-1" class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm">
		<li>
			<button onclick={() => confirmClearFsaModal.showModal()}>
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
	</ul>
</div>

<dialog id="confirm-clear-fsa-modal" bind:this={confirmClearFsaModal} class="modal">
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
			<form class="w-full" onsubmit={confirmClearGraph}>
				<div class="flex justify-end gap-4">
					<button type="button" class="btn" onclick={() => confirmClearFsaModal.close()}>
						Cancel
					</button>
					<button type="submit" class="btn btn-error">Confirm</button>
				</div>
			</form>
		</div>
	</div>
</dialog>
