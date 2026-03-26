<script lang="ts">
	import { Check, X, Minus, CircleQuestionMark } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { FloatingWindow, WINDOWS_ID } from '$lib/windows';
	import { FSAGraph, FSAType } from '$lib/automata-models';

	const fsa: FSAGraph = $derived(app.fsaGraph);
	const prettyAlphabet: string = $derived.by(() => {
		const sortedAlphabet = [...fsa.alphabet(true)].sort();
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

{#snippet statusRow(label: string, value: boolean | null)}
	<div class="ml-2 flex items-center gap-2">
		{#if value === null}
			<Minus class="h-3.5 w-3.5 shrink-0 text-warning" />
		{:else if value}
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
			<span>Automaton Info</span>
		{/snippet}

		{#snippet content()}
			<div class="flex flex-col gap-3">
				<!-- Title -->
				<div class="flex flex-col gap-1">
					<div
						class="flex items-baseline gap-1 hover:cursor-help"
						title="This is purely cosmetic, to help you identify your FSA when importing/exporting."
					>
						<label for="fsa-title" class="font-semibold">Title</label>
						<CircleQuestionMark class="h-3 w-3" />
					</div>
					<input id="fsa-title" type="text" class="input w-full max-w-xs" bind:value={fsa.title} />
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
					{@render statusRow('Is complete (DFAs only)', fsa.isComplete)}
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
