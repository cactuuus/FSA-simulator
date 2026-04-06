<script lang="ts">
	import { BookOpen, Check, X } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { FloatingWindow, WINDOWS_ID } from '$lib/windows';
	import { FSAGraph, FSAType } from '$lib/automata-models';
	import { MANUAL_SECTIONS, manualHref } from '$lib/utils/manual';

	const fsa: FSAGraph = $derived(app.fsaGraph);
	const prettyAlphabet: string = $derived.by(() => {
		const sortedAlphabet = [...fsa.alphabet(false)].sort();
		if (sortedAlphabet.length === 0) return '∅';
		return `{ ${sortedAlphabet.join(', ')} }`;
	});

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
	<div class="ml-2 flex items-center gap-2">
		{#if value}
			<Check class="h-3.5 w-3.5 shrink-0 text-success" />
		{:else}
			<X class="h-3.5 w-3.5 shrink-0 text-error" />
		{/if}
		<span class="text-sm text-base-content/70">{label}</span>
	</div>
{/snippet}

{#if app.windows.isOpen(WINDOWS_ID.AutomatonInfo)}
	<FloatingWindow
		id={WINDOWS_ID.AutomatonInfo}
		windowState={app.windows.open(WINDOWS_ID.AutomatonInfo)}
		onClose={() => app.windows.close(WINDOWS_ID.AutomatonInfo)}
		onFocus={() => app.windows.bringToFront(WINDOWS_ID.AutomatonInfo)}
		defaultWidth={300}
	>
		{#snippet header()}
			<span class="flex items-center gap-2">
				Automaton Info
				<a
					href={manualHref(MANUAL_SECTIONS.INTRODUCTION)}
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:text-secondary"
					title="Open manual section about automata"
				>
					<BookOpen class="h-4 w-4" />
				</a>
			</span>
		{/snippet}

		{#snippet content()}
			<div class="flex flex-col gap-3">
				<!-- Title -->
				<div class="flex flex-col gap-1">
					<label for="fsa-title" class="font-semibold"> Title </label>
					<input
						id="fsa-title"
						type="text"
						class="input w-full max-w-xs"
						bind:value={fsa.title}
						placeholder="Untitled"
					/>
				</div>

				<!-- Description -->
				<div class="flex flex-col gap-1">
					<label for="fsa-description" class="font-semibold"> Description </label>
					<textarea
						id="fsa-description"
						class="textarea w-full"
						rows={1}
						bind:value={fsa.description}
						placeholder="Enter notes or a description for this automaton"
					></textarea>
				</div>

				<hr class="border-base-content/30" />

				<!-- Type -->
				<div class="flex flex-col gap-1">
					<h3 class="font-semibold">Type</h3>
					<div class="ml-2">
						<span class="font-semibold text-info">
							{fsa.type}
						</span>
						<span class=" text-base-content/70">
							({typeToFullLabel(fsa.type)})
						</span>
					</div>
				</div>

				<hr class="border-base-content/30" />

				<!-- Alphabet -->
				<div class="flex flex-col gap-1">
					<h3 class="font-semibold">Alphabet</h3>
					<div class="ml-2">
						<span class="font-semibold text-info">
							{prettyAlphabet}
						</span>
					</div>
				</div>

				<hr class="border-base-content/30" />

				<!-- Useful properties -->
				<div class="flex flex-col gap-1">
					<h3 class="font-semibold">Properties</h3>
					{@render statusRow('Has start state', fsa.hasStart)}
					{@render statusRow('Has accepting state(s)', fsa.hasAcceptingNodes)}
					{#if fsa.type === FSAType.DFA || fsa.type === FSAType.NFA}
						{@render statusRow('Is complete (DFAs and NFAs only)', fsa.isComplete!)}
					{/if}
					{@render statusRow('Is deterministic', fsa.isDeterministic)}
					{@render statusRow('Has stack', fsa.hasStackOps)}
				</div>

				<hr class="border-base-content/30" />

				<!-- Less useful properties -->
				<div class="flex flex-col gap-1">
					<h3 class="font-semibold">Other info</h3>
					<div class="ml-2">
						<span class="text-base-content/70"> States count: </span>
						<span class="font-bold">{fsa.nodes.length}</span>
					</div>
					<div class="ml-2">
						<span class="text-base-content/70"> Transitions count: </span>
						<span class="font-bold">{fsa.transitions.length}</span>
					</div>
				</div>
			</div>
		{/snippet}
	</FloatingWindow>
{/if}
