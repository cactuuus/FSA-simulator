<script lang="ts">
	import { Folder, Download } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';

	/**
	 * Opens the system's file dialog to select a .json file to upload.
	 */
	function openFileDialog() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.fsa';
		input.onchange = async () => {
			if (input.files && input.files.length > 0) {
				const file = input.files[0];
				await app.uploadGraph(file);
			}
		};
		input.click();
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
		<li>
			<button onclick={() => app.downloadGraph()}>
				<Download class="h-4 w-4" /> Save to disk
			</button>
		</li>
	</ul>
</div>
