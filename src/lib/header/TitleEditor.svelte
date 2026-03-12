<script lang="ts">
	import { SquarePen } from '@lucide/svelte';
	import type { FSAGraph } from '$lib/automata-models';

	const { fsaGraph }: { fsaGraph: FSAGraph } = $props();
	let modal: HTMLDialogElement;
	let newTitle = $state<string>('');

	function openModal() {
		newTitle = fsaGraph.title;
		modal.showModal();
	}

	function saveAndClose(e: SubmitEvent) {
		e.preventDefault();
		fsaGraph.title = newTitle;
		newTitle = '';
		closeModal();
	}

	function closeModal() {
		newTitle = '';
		modal.close();
	}
</script>

<button
	class="flex cursor-pointer items-center gap-2 px-2 hover:text-secondary"
	onclick={openModal}
>
	<span class="line-clamp-1 max-w-40 truncate overflow-hidden">
		{fsaGraph.title}
	</span>
	<SquarePen class="h-4 w-4 opacity-80" />
</button>

<dialog id="rename-fsa-modal" bind:this={modal} class="modal">
	<div class="modal-box w-11/12 max-w-sm">
		<h3 class="text-lg font-bold">Rename FSA graph</h3>
		<div class="modal-action mt-4">
			<form class="w-full" onsubmit={saveAndClose}>
				<input
					id="rename-fsa"
					class="input w-full"
					bind:value={newTitle}
					required
					autocomplete="off"
				/>
				<div class="mt-4 flex justify-end gap-4">
					<button type="button" class="btn" onclick={closeModal}>Cancel</button>
					<button type="submit" class="btn btn-success">Confirm</button>
				</div>
			</form>
		</div>
	</div>
</dialog>
