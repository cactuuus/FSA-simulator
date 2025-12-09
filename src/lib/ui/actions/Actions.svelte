<script lang="ts">
	import { Folder, Download } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { notifyError } from '$lib/utils/notifications.svelte';
	import { UserFacingError } from '$lib/utils';

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
				throw new UserFacingError('No file selected.')
			} else if (files.length > 1) {
				throw new UserFacingError('Please select only one file.')
			}
			const file = files[0];
			if (!file.name.endsWith('.fsa')) {
				throw new UserFacingError('Invalid file type, select a \'.fsa\' file.');
			}
			await app.uploadGraph(file).catch((error: Error) => {
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
		await app.downloadGraph().catch((error: Error) => {
			notifyError(error);
		});
	}
</script>

<div class="dropdown dropdown-start">
	<button tabindex="0" class="flex link items-center link-hover"> File ⏷ </button>
	<ul tabindex="-1" class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm">
		<li>
			<button onclick={openFileDialog}>
				<Folder class="h-4 w-4" /> Open
			</button>
		</li>
			{#if app.canDownloadGraph()}
				<li>
					<button onclick={downloadGraph}>
						<Download class="h-4 w-4" /> Save to disk
					</button>
				</li>
			{:else}
				<li class="tooltip tooltip-bottom" data-tip="Cannot download an empty graph">
					<button class="opacity-50 cursor-default bg-transparent w-full" disabled>
						<Download class="h-4 w-4" /> Save to disk
					</button>
				</li>
			{/if}
	</ul>
</div>
