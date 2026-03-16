<script lang="ts">
	import { ListPlus, ListX } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { EnableStackOpsCommand, DisableStackOpsCommand } from '$lib/editor/commands';
	import { notifySuccess } from '$lib/utils/notifications';
	import { portal } from '$lib/utils/portal';

	const fsa = $derived(app.fsaGraph);
	let togglePdaModal: HTMLDialogElement;
	let pendingPdaState = $state(false);

	function openTogglePdaModal() {
		pendingPdaState = !fsa.hasStackOps;
		togglePdaModal.showModal();
	}

	function togglePda(e: SubmitEvent) {
		e.preventDefault();
		if (pendingPdaState) {
			app.commandHistory.pushAndExecute(new EnableStackOpsCommand());
			notifySuccess('PDA mode enabled.');
		} else {
			app.commandHistory.pushAndExecute(new DisableStackOpsCommand());
			notifySuccess('PDA mode disabled.');
		}
		togglePdaModal.close();
	}
</script>

<h2 class="menu-title">FSA</h2>
<ul>
	<li>
		<button onclick={() => openTogglePdaModal()}>
			{#if fsa.hasStackOps}
				<ListX class="h-4 w-4" />
				Disable stack
			{:else}
				<ListPlus class="h-4 w-4" />
				Enable stack
			{/if}
		</button>
	</li>
</ul>

<!-- Modals  -->

<dialog bind:this={togglePdaModal} class="modal" use:portal>
	<div class="modal-box">
		<h3 class="text-lg font-bold {pendingPdaState ? 'text-info' : 'text-error'}">
			{pendingPdaState ? 'Enable Stack' : 'Disable Stack'}
		</h3>
		<p class="pt-2 text-sm text-base-content/70">
			{#if pendingPdaState}
				This will turn your FSA into a Push-down Automaton, enabling stack operations (pop & push)
				for all transitions. You can always revert this later.
			{:else}
				This will remove all stack operations from all transitions.
				<br />
				<strong>
					Stack symbols can be recovered ONLY by undoing this action (via the undo button or
					CTRL+Z). Simply re-enabling the stack will not recover the them.
				</strong>
			{/if}
		</p>
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
