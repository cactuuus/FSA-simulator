<script lang="ts">
	import { ListPlus, ListX } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import {
		EnableStackOpsCommand,
		DisableStackOpsCommand,
		LoadGraphCommand
	} from '$lib/editor/commands';
	import { notifySuccess, notifyError, notifyWarning } from '$lib/utils/notifications';
	import { NfaToDfa, minimizeDfa } from '$lib/fsa-operations';
	import { portal } from '$lib/utils/portal';
	import { FSAType } from '$lib/automata-models';

	const BIG_FSA_THRESHOLD = 20;
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

	function convertToDfa() {
		if (fsa.type !== FSAType.NFA) {
			notifyError('Only NFAs can be converted to DFAs.');
			return;
		}
		if (!fsa.hasStart) {
			notifyError('The FSA must have a start node to be converted.');
			return;
		}
		try {
			const dfa = NfaToDfa(fsa);
			app.commandHistory.pushAndExecute(new LoadGraphCommand(dfa));
			if (dfa.nodes.length > BIG_FSA_THRESHOLD) {
				notifyWarning(
					'The resulting DFA seems to have a large number of states, consider minimizing it!'
				);
			}
		} catch (error) {
			console.error('Error converting NFA to DFA:', error);
			notifyError('Conversion failed, check the console for details.');
		}
	}

	function toMinimizedDfa() {
		if (fsa.type !== FSAType.DFA) {
			notifyError('Only DFAs can be minimized.');
			return;
		}
		if (!fsa.hasStart) {
			notifyError('The FSA must have a start node to be minimized.');
			return;
		}
		try {
			const minimized = minimizeDfa(fsa);
			if (minimized === null) {
				notifySuccess('The DFA is already minimal, no changes were made.');
				return;
			} else {
				app.commandHistory.pushAndExecute(new LoadGraphCommand(minimized));
				notifySuccess('DFA minimized successfully.');
			}
		} catch (error) {
			console.error('Error minimizing DFA:', error);
			notifyError('Minimization failed, check the console for details.');
		}
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
	{#if fsa.type === FSAType.NFA}
		<li>
			<button onclick={() => convertToDfa()}> Convert to DFA </button>
		</li>
	{:else if fsa.type === FSAType.DFA}
		<li>
			<button onclick={() => toMinimizedDfa()}> Minimize DFA </button>
		</li>
	{/if}
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
