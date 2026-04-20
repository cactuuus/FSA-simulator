<script lang="ts">
	import { ListPlus, ListX, Copy, Check, Regex, Combine, FunnelPlus } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import {
		EnableStackOpsCommand,
		DisableStackOpsCommand,
		LoadGraphCommand
	} from '$lib/editor/commands';
	import { notifySuccess, notifyError, notifyWarning } from '$lib/utils/notifications';
	import { NfaToDfa, minimizeDfa, toRegex, toComplete } from '$lib/fsa-operations';
	import { portal } from '$lib/utils/portal';
	import { FSAType } from '$lib/automata-models';

	const BIG_FSA_THRESHOLD = 20;
	const fsa = $derived(app.fsaGraph);

	let togglePdaModal: HTMLDialogElement;
	let pendingPdaState = $state(false);

	let regexModal: HTMLDialogElement;
	let regex = $state('');
	let regexCopied = $state(false);

	async function copyRegex() {
		await navigator.clipboard.writeText(regex);
		regexCopied = true;
		setTimeout(() => (regexCopied = false), 2000);
	}

	function openTogglePdaModal() {
		pendingPdaState = !fsa.hasStackOps;
		togglePdaModal.showModal();
	}

	function togglePda(e: SubmitEvent) {
		e.preventDefault();
		if (pendingPdaState) {
			app.commandHistory.pushAndExecute(new EnableStackOpsCommand());
			app.viewport.panTo(...app.fsaGraph.nodes.map((n) => n.pos));
			notifySuccess('PDA mode enabled.');
		} else {
			app.commandHistory.pushAndExecute(new DisableStackOpsCommand());
			app.viewport.panTo(...app.fsaGraph.nodes.map((n) => n.pos));
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
			app.viewport.panTo(...dfa.nodes.map((n) => n.pos));
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
				app.viewport.panTo(...minimized.nodes.map((n) => n.pos));
				notifySuccess('DFA minimized successfully.');
			}
		} catch (error) {
			console.error('Error minimizing DFA:', error);
			notifyError('Minimization failed, check the console for details.');
		}
	}

	function convertToRegex() {
		if (fsa.hasStackOps) {
			notifyError('FSAs with stack operations cannot be converted to regex.');
			return;
		}
		if (!fsa.hasStart) {
			notifyError('The FSA must have a start node to be converted.');
			return;
		}
		try {
			regex = toRegex(fsa);
			regexModal.show();
		} catch (error) {
			console.error('Error converting FSA to regex:', error);
			notifyError('Conversion failed, check the console for details.');
		}
	}

	function convertToComplete() {
		if (fsa.type !== FSAType.DFA && fsa.type !== FSAType.NFA) {
			notifyError('Only DFAs and NFAs can be made complete.');
			return;
		}
		try {
			const complete = toComplete(fsa);
			if (complete === null) {
				notifySuccess('The FSA is already complete, no changes were made.');
				return;
			} else {
				app.commandHistory.pushAndExecute(new LoadGraphCommand(complete));
				app.viewport.panTo(...complete.nodes.map((n) => n.pos));
				notifySuccess('FSA turned complete successfully.');
			}
		} catch (error) {
			console.error('Error making FSA complete:', error);
			notifyError('Failed to make FSA complete, check the console for details.');
		}
	}
</script>

<h2 class="menu-title">FSA Operations ({fsa.type})</h2>
<ul>
	<!-- Conversion to/from pushdown -->
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

	<!-- Conversion to regex/CFG (depending on type) -->
	{#if !fsa.hasStackOps}
		<li>
			<button onclick={() => convertToRegex()}>
				<Regex class="h-4 w-4" /> To Regex
			</button>
		</li>
	{:else}
		<li title="Not yet supported, stay tuned for updates!">
			<button disabled class="cursor-not-allowed opacity-50">
				<Regex class="h-4 w-4" /> To CFG
			</button>
		</li>
	{/if}

	<!-- Type specific conversions
		NFA -> DFA
		DFA -> Minimized DFA
		PDA -> DPDA (not implemented yet)
		DPDA -> Minimized DPDA (not implemented yet)
	 -->
	{#if fsa.type === FSAType.NFA}
		<li>
			<button onclick={() => convertToDfa()}>
				<Combine class="h-4 w-4" /> Convert to DFA
			</button>
		</li>
	{:else if fsa.type === FSAType.DFA}
		<li>
			<button onclick={() => toMinimizedDfa()}>
				<Combine class="h-4 w-4" /> Minimize DFA
			</button>
		</li>
	{:else if fsa.type === FSAType.PDA}
		<li title="Not yet supported, stay tuned for updates!">
			<button disabled class="cursor-not-allowed opacity-50">
				<Combine class="h-4 w-4" /> Convert to DPDA
			</button>
		</li>
	{:else if fsa.type === FSAType.DPDA}
		<li title="Not yet supported, stay tuned for updates!">
			<button disabled class="cursor-not-allowed opacity-50">
				<Combine class="h-4 w-4" /> Minimize DPDA
			</button>
		</li>
	{/if}

	<!-- Make Complete (DFA and NFA only) -->
	{#if fsa.type === FSAType.DFA || fsa.type === FSAType.NFA}
		<li>
			<button onclick={() => convertToComplete()}>
				<FunnelPlus class="h-4 w-4" /> Make Complete
			</button>
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

<dialog bind:this={regexModal} class="modal" use:portal>
	<div class="modal-box max-w-2xl">
		<div class="flex items-start justify-between">
			<div>
				<h3 class="text-lg font-bold">Equivalent Regular Expression</h3>
				<p class="pt-1 text-sm text-base-content/70">
					Note that this might not be the most optimal regex for this language!
				</p>
			</div>
			<button class="btn btn-sm {regexCopied ? 'btn-success' : 'btn-ghost'}" onclick={copyRegex}>
				{#if regexCopied}
					<Check class="h-4 w-4" /> Copied!
				{:else}
					<Copy class="h-4 w-4" /> Copy
				{/if}
			</button>
		</div>
		<div class="mt-4 max-h-[50vh] overflow-auto rounded-md bg-base-200 p-4 font-mono text-sm">
			{regex}
		</div>
		<div class="modal-action mt-4">
			<button class="btn" onclick={() => regexModal.close()}>Close</button>
		</div>
	</div>
</dialog>
