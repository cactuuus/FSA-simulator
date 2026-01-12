<script lang="ts">
	import { app } from '$lib/stores/app.svelte';
	import { SquarePen } from '@lucide/svelte';

	let modal: HTMLDialogElement;
	let newTitle = $state<string>('');

	function openModal() {
		newTitle = app.fsaGraph.title;
		modal.showModal();
	}

	function saveAndClose(e: SubmitEvent) {
		e.preventDefault();
		app.fsaGraph.title = newTitle;
		newTitle = '';
		closeModal();
	}

	function closeModal() {
		newTitle = '';
		modal.close();
	}
</script>

<button class="flex cursor-pointer items-center gap-2 px-2 hover:bg-secondary" onclick={openModal}>
	<span class="line-clamp-1 max-w-40 truncate overflow-hidden">
		{app.fsaGraph.title}
	</span>
	<SquarePen class="h-4 w-4 opacity-80" />
</button>

<dialog bind:this={modal} class="modal">
	<div class="modal-box w-11/12 max-w-xs">
		<h3 class="font-bold">Rename FSA graph</h3>
		<div class="modal-action mt-2">
			<form class="w-full" onsubmit={saveAndClose}>
				<input class="input" bind:value={newTitle} autocomplete="off" />
				<div class="mt-2 flex justify-end gap-4">
					<button type="button" class="btn btn-sm" onclick={closeModal}>Cancel</button>
					<button type="submit" class="btn btn-sm btn-success">Confirm</button>
				</div>
			</form>
		</div>
	</div>
</dialog>
