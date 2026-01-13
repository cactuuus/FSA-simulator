<script lang="ts">
	import { Folder, Download, ChevronDown, Loader, TriangleAlert } from '@lucide/svelte';
	import {
		uploadWorkingGraph,
		downloadWorkingGraph,
		clearWorkingGraph
	} from '$lib/stores/fsa.svelte';
	import { resetViewport } from '$lib/stores/viewport.svelte';
	import { notifyError } from '$lib/utils/notifications.svelte';
	import { UserFacingError } from '$lib/utils';

	let confirmClearFsaModal: HTMLDialogElement;

	/**
	 * Opens the system's file dialog to select a .json file to upload.
	 */
	function openFileDialog() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.fsa';
		input.multiple = false;
		input.onchange = () => handleFileUpload(input.files);
		input.click();
	}

	/**
	 * Handles the file upload process.
	 * @param files The list of files selected by the user (should be only one).
	 */
	async function handleFileUpload(files: FileList | null) {
		try {
			if (!files || files.length === 0) {
				throw new UserFacingError('No file selected.');
			} else if (files.length > 1) {
				throw new UserFacingError('Please select only one file.');
			}
			const file = files[0];
			if (!file.name.endsWith('.fsa')) {
				throw new UserFacingError("Invalid file type, select a '.fsa' file.");
			}
			await uploadWorkingGraph(file).catch((error: Error) => {
				notifyError(error);
			});
		} catch (error) {
			notifyError(error);
		}
	}

	/**
	 * Downloads the current graph to disk.
	 */
	async function downloadGraph() {
		await downloadWorkingGraph().catch((error: Error) => {
			notifyError(error);
		});
	}

	/**
	 * Clears the current FSA graph then closes the confirmation dialog.
	 * @param e The submit event from the confirmation form.
	 */
	async function confirmClearGraph(e: SubmitEvent) {
		e.preventDefault();
		clearWorkingGraph();
		resetViewport();
		confirmClearFsaModal.close();
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
