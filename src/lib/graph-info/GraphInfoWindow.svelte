<script lang="ts">
	import { Pencil, Check, X, Info, ChevronRight } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { FloatingWindow, WINDOWS_ID } from '$lib/windows';
	import { EnableStackOpsCommand, DisableStackOpsCommand } from '$lib/editor/commands';
	import { notifySuccess } from '$lib/utils/notifications';
	import { portal } from '$lib/utils/portal';
	import { FSAType } from '$lib/automata-models';

	const fsa = $derived(app.fsaGraph);
	let draftTitle = $state('');
	let editTitleModal: HTMLDialogElement;
	let togglePdaModal: HTMLDialogElement;
	let pendingPdaState = $state(false);

	function openEditTitleModal() {
		draftTitle = fsa.title;
		editTitleModal.showModal();
	}

	function commitTitle(e: SubmitEvent) {
		e.preventDefault();
		const trimmed = draftTitle.trim();
		if (trimmed) fsa.title = trimmed;
		closeTitleModal();
	}

	function closeTitleModal() {
		draftTitle = '';
		editTitleModal.close();
	}

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

	function typeToFullLabel(type: FSAType): string {
		switch (type) {
			case 'DFA':
				return 'Deterministic Finite State Automaton';
			case 'NFA':
				return 'Non-deterministic Finite State Automaton';
			case 'PDA':
				return 'Push-down Automaton';
			case 'DPDA':
				return 'Deterministic Push-down Automaton';
			default:
				return 'Unknown Type';
		}
	}
</script>

{#snippet statusRow(label: string, value: boolean)}
	<div class="flex items-center gap-2">
		{#if value}
			<Check class="h-3.5 w-3.5 shrink-0 text-success" />
		{:else}
			<X class="h-3.5 w-3.5 shrink-0 text-error" />
		{/if}
		<span class="text-sm text-base-content/70">{label}</span>
	</div>
{/snippet}

{#if app.windows.isOpen(WINDOWS_ID.GraphInfo)}
	<FloatingWindow
		id={WINDOWS_ID.GraphInfo}
		windowState={app.windows.open(WINDOWS_ID.GraphInfo)}
		onClose={() => app.windows.close(WINDOWS_ID.GraphInfo)}
		canBeResized={true}
	>
		{#snippet header()}
			<span>Graph Info</span>
		{/snippet}

		{#snippet content()}
			<div class="flex flex-col gap-3">
				<!-- Title -->
				<div class="flex flex-col gap-1">
					<h3 class="font-semibold">Title</h3>
					<p class="text-base-content/70">
						<Info class="inline h-3 w-3" />
						This is purely cosmetic, to help you identify your FSA when importing/exporting.
					</p>
					<div class="flex items-center gap-2">
						<input
							id="readonly-fsa-title"
							type="text"
							class="pointer-events-none input w-full max-w-xs"
							bind:value={fsa.title}
							readonly
						/>
						<button class="btn btn-sm" onclick={openEditTitleModal}>
							<Pencil class="h-3 w-3" /> Edit
						</button>
					</div>
				</div>

				<hr class="border-base-content/70" />

				<!-- Type -->
				<div class="flex flex-col gap-1">
					<h3 class="font-semibold">Type</h3>
					<div>
						<span class="font-semibold text-info">
							<ChevronRight class="inline h-3 w-3 " />
							{fsa.type}
						</span>
						<span class=" text-base-content/70">
							({typeToFullLabel(fsa.type)})
						</span>
					</div>
				</div>

				<hr class="border-base-content/70" />

				<!-- Useful properties -->
				<div class="flex flex-col gap-1">
					<h3 class="font-semibold">Properties</h3>
					{@render statusRow('Has start state', fsa.hasStart)}
					{@render statusRow('Has accepting state', fsa.hasAcceptingNodes)}
					{@render statusRow('Is deterministic', fsa.isDeterministic)}
					<div class="flex items-center gap-2">
						{@render statusRow('Has stack', fsa.hasStackOps)}
						{#if fsa.hasStackOps}
							<button class="btn shrink-0 btn-soft btn-xs btn-error" onclick={openTogglePdaModal}>
								Disable
							</button>
						{:else}
							<button class="btn shrink-0 btn-soft btn-xs btn-info" onclick={openTogglePdaModal}>
								Enable
							</button>
						{/if}
					</div>
				</div>

				<hr class="border-base-content/70" />

				<!-- Less useful properties -->
				<div class="flex flex-col gap-1">
					<h3 class="font-semibold">Other info</h3>
					<div>
						<span class="text-base-content/70">
							<ChevronRight class="inline h-3 w-3 " />
							States count:
						</span>
						<span class="font-bold">{fsa.nodes.length}</span>
					</div>
					<div>
						<span class="text-base-content/70">
							<ChevronRight class="inline h-3 w-3 " />
							Transitions count:
						</span>
						<span class="font-bold">{fsa.transitions.length}</span>
					</div>
				</div>
			</div>
		{/snippet}
	</FloatingWindow>
{/if}

<!-- Edit title modal -->
<dialog bind:this={editTitleModal} class="modal" use:portal>
	<div class="modal-box w-11/12 max-w-md">
		<h3 class="text-lg font-bold">Edit FSA Title</h3>
		<div class="modal-action mt-4">
			<form class="w-full" onsubmit={commitTitle}>
				<input class="input w-full" bind:value={draftTitle} required autocomplete="off" />
				<div class="mt-4 flex justify-end gap-4">
					<button type="button" class="btn" onclick={closeTitleModal}>Cancel</button>
					<button type="submit" class="btn btn-success">Confirm</button>
				</div>
			</form>
		</div>
	</div>
</dialog>

<!-- PDA toggle modal -->
<dialog bind:this={togglePdaModal} class="modal" use:portal>
	<div class="modal-box">
		<h3 class="text-lg font-bold {pendingPdaState ? 'text-info' : 'text-error'}">
			{pendingPdaState ? 'Enable PDA Mode' : 'Disable PDA Mode'}
		</h3>
		<p class="pt-2 text-sm text-base-content/70">
			{#if pendingPdaState}
				This will turn your FSA into a PDA, enabling stack operations (pop & push) for all
				transitions. You can always revert this later.
			{:else}
				This will remove all stack operations from all transitions.
				<br />
				<strong
					>Stack symbols can only be recovered by undoing this action (via the undo button or
					CTRL+Z). Simply re-enabling the stack will not recover the them.</strong
				>
			{/if}
		</p>
		<div class="modal-action mt-4">
			<form class="w-full" onsubmit={togglePda}>
				<div class="flex justify-end gap-4">
					<button type="button" class="btn" onclick={() => togglePdaModal.close()}>Cancel</button>
					<button type="submit" class="btn {pendingPdaState ? 'btn-info' : 'btn-error'}"
						>Confirm</button
					>
				</div>
			</form>
		</div>
	</div>
</dialog>
