<script lang="ts">
	import { Check, X, ChevronRight, CircleQuestionMark } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { FloatingWindow, WINDOWS_ID } from '$lib/windows';
	import { FSAType } from '$lib/automata-models';

	const fsa = $derived(app.fsaGraph);

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

				<hr class="border-base-content/30" />

				<!-- Useful properties -->
				<div class="flex flex-col gap-1">
					<h3 class="font-semibold">Properties</h3>
					{@render statusRow('Has start state', fsa.hasStart)}
					{@render statusRow('Has accepting state', fsa.hasAcceptingNodes)}
					{@render statusRow('Is deterministic', fsa.isDeterministic)}
					{@render statusRow('Has stack', fsa.hasStackOps)}
				</div>

				<hr class="border-base-content/30" />

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
