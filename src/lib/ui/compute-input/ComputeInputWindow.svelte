<script lang="ts">
	import { Info, TriangleAlert, Check, RefreshCcw, CircleX, Play } from '@lucide/svelte';
	import { WINDOWS_ID } from '$lib/interaction/Windows.svelte';
	import FloatingWindow from '$lib/ui/components/FloatingWindow.svelte';
	import { ComputationTree, type ComputationNode } from '$lib/automata/analisys';
	import { app } from '$lib/stores/app.svelte';
	import { notifyWarning, notifyError } from '$lib/utils/notifications';
	import { FSAType, type SerializedFSAGraph } from '$lib/automata/models';
	import { toggleHighlight } from '$lib/utils/graphEffects';

	let computationTree = $state<ComputationTree | null>(null);
	let inputToProcess = $state<string>('');
	let fsaDataWhenProcessed = $state<SerializedFSAGraph | null>(null);
	let lastUsedInput = $state<string[]>([]);
	let isProcessing = $state<boolean>(false);
	let maxLoopsIterations = $state<number>(0);
	const alphabetIsSingleChar = $derived<boolean>(
		[...app.fsaGraph.alphabet()].every((s) => s.length === 1)
	);
	const cleanedInput = $derived.by<string[]>(() => {
		const separator = alphabetIsSingleChar ? '' : ',';
		return inputToProcess
			.trim()
			.split(separator)
			.map((s) => s.trim());
	});
	const canProcessInput = $derived.by<{ result: boolean; errors?: string[] }>(() => {
		const errors: string[] = [];
		if (cleanedInput.some((s) => s === '') && inputToProcess.length > 0) {
			if (alphabetIsSingleChar) {
				errors.push('Input contains empty symbols, please remove any extra spaces.');
			} else {
				errors.push('Input contains empty symbols, please remove any extra commas.');
			}
		}
		if (cleanedInput.some((s) => !app.fsaGraph.alphabet().has(s))) {
			errors.push("Input contains symbols that are not in the FSA's alphabet.");
		}
		if (!app.fsaGraph.hasStart) {
			errors.push('The graph has no start state, it cannot process any input.');
		}
		return { result: errors.length === 0, errors };
	});

	async function runInputComputation(cleanedInput: string[]): Promise<void> {
		if (!canProcessInput.result) {
			canProcessInput.errors?.forEach((error) => notifyWarning(error));
			return;
		}
		try {
			isProcessing = true;
			computationTree = new ComputationTree(app.fsaGraph, cleanedInput, maxLoopsIterations);
			fsaDataWhenProcessed = app.fsaGraph.toJSON();
			lastUsedInput = cleanedInput;
			console.log(computationTree?.toString()); // TODO: remove after implementation and testing
		} catch (error: unknown) {
			console.error('Failed to compute input:', error);
			notifyError(
				'Failed to compute input, an unexpected error occurred. Check console for details.'
			);
		} finally {
			isProcessing = false;
		}
	}

	function fsaHasChangedSinceLastProcess(): boolean {
		return fsaDataWhenProcessed
			? JSON.stringify(app.fsaGraph.toJSON()) !== JSON.stringify(fsaDataWhenProcessed)
			: true;
	}

	/**
	 * Highlights or unhighlights a path in the graph, given a list of computation nodes representing the path.
	 * @param state Whether to add or remove the highlight.
	 * @param path The path to highlight, given as a list of computation nodes.
	 */
	function togglePathHighlight(state: boolean, path: ComputationNode[]): void {
		const ids = new Set<string>(['start-edge']);
		path.forEach((node) => {
			node.config.state.id && ids.add(node.config.state.id);
			if (node.transitionTaken) ids.add(node.transitionTaken.id);
		});
		toggleHighlight(state, ...ids);
	}
</script>

<FloatingWindow
	id={WINDOWS_ID.ComputeInput}
	windowState={app.windows.open(WINDOWS_ID.ComputeInput)}
	onClose={() => app.windows.close(WINDOWS_ID.ComputeInput)}
>
	{#snippet header()}
		<span>Compute Input</span>
	{/snippet}
	{#snippet content()}
		<div class="mb-2 flex flex-col gap-2 rounded-box bg-base-300 p-3">
			<label for="input-to-process" class="font-semibold"> Input to process </label>
			{#if !alphabetIsSingleChar}
				<p class="text-xs text-warning/70 italic">
					<TriangleAlert class="inline h-3 w-3" />
					Since your alphabet contains symbols longer than one character, please separate symbols with
					commas.
				</p>
			{/if}
			<div class="flex flex-wrap gap-2">
				<input
					type="text"
					id="input-to-process"
					placeholder={alphabetIsSingleChar ? 'e.g. aabbab' : 'e.g. symbol1, symbol2'}
					class="input input-sm w-full max-w-xs"
					bind:value={inputToProcess}
				/>
				<div class="flex justify-end gap-2">
					<button class="btn btn-sm btn-success" onclick={() => runInputComputation(cleanedInput)}>
						Compute Input
					</button>
				</div>
			</div>
			{#if canProcessInput.errors}
				<ul class="flex list-inside flex-col gap-1">
					{#each canProcessInput.errors as error}
						<li class="rounded-box bg-error/10 p-2 text-error">{error}</li>
					{/each}
				</ul>
			{/if}
			{#if app.fsaGraph.type === FSAType.PDA || app.fsaGraph.type === FSAType.DPDA}
				<label for="max-loops" class="text-sm font-semibold"> Maximum loop iterations </label>
				<p class="text-xs text-base-content/70 italic">
					<Info class="inline h-3 w-3" />
					If an infinite loop is detected, this limits the number of loops before branch exploration is
					stopped. <strong>Use wisely, a value too high is just as bad as no limit at all.</strong>
				</p>
				<input
					type="number"
					id="max-loops"
					class="input input-sm w-full max-w-20"
					bind:value={maxLoopsIterations}
					min={0}
				/>
			{/if}
		</div>

		<div class="relative flex flex-col gap-2 rounded-box bg-base-300 p-3">
			<h3 class="border-b border-base-content/30 font-semibold">Result</h3>
			{#if computationTree}
				{@const acceptingPaths = computationTree.acceptingPaths}
				<!-- Computation results -->
				{#if computationTree.warnings.length > 0}
					<details class="collapse-arrow collapse rounded-box bg-warning/10 text-warning">
						<summary class="collapse-title p-2 font-semibold">
							<TriangleAlert class="inline h-4 w-4" />
							{computationTree.warnings.length} Warnings
						</summary>
						<div class="collapse-content">
							<ul class="list-inside list-disc text-sm">
								{#each computationTree.warnings as warning}
									<li>{warning}</li>
								{/each}
							</ul>
						</div>
					</details>
				{/if}
				{#if acceptingPaths.length > 0}
					<details class="collapse-arrow collapse rounded-box bg-success/10 text-success">
						<summary class="collapse-title p-2 font-semibold">
							<Check class="inline h-4 w-4" />
							{acceptingPaths.length} Accepting Path{acceptingPaths.length > 1 ? 's' : ''}
						</summary>
						<div class="collapse-content">
							<p class="mb-2 rounded-box text-xs text-base-content/70 italic">
								<Info class="inline h-3 w-3" />
								Click on a path to run a simulation of only the path itself.
							</p>
							<ul class="list-inside list-disc font-semibold">
								{#each acceptingPaths as path, index (index)}
									<li
										class="hover:cursor-pointer hover:text-secondary"
										onmouseenter={() => togglePathHighlight(true, path)}
										onmouseleave={() => togglePathHighlight(false, path)}
									>
										{path.map((node: ComputationNode) => node.config.state.label).join(' → ')}
									</li>
								{/each}
							</ul>
						</div>
					</details>
				{:else}
					<p class="rounded-box bg-error/10 p-2 text-sm text-error">
						<span class="font-bold">
							<CircleX class="inline h-4 w-4" />
							Input rejected!
						</span>
						<br />
						No accepting paths were found in the computation tree.
					</p>
				{/if}
				<div>
					<button
						onclick={() => app.enterSimulation(computationTree!)}
						class="btn btn-sm btn-success"
					>
						<Play class="h-4 w-4" />
						Run Full Simulation
					</button>
				</div>

				<!-- Overlay to cover outdated results -->
				{#if fsaHasChangedSinceLastProcess()}
					<div
						class="absolute inset-0 flex flex-col items-center justify-center rounded-box bg-base-200/90"
					>
						<p class="mx-auto p-2 text-center">
							The FSA has changed since the last time the input was processed. <br />
							Re-compute to access updated results.
						</p>
						<button
							class="btn btn-sm btn-neutral"
							onclick={() => runInputComputation(lastUsedInput)}
						>
							<RefreshCcw class="h-4 w-4" /> Re-Compute Previous Input
						</button>
					</div>
				{/if}
			{:else}
				<p class="mx-auto p-2 text-center text-sm text-base-content/70 italic">
					Nothing to show yet, compute an input to see the result here.
				</p>
			{/if}

			<!-- Overlay to cover outdated results -->
			{#if isProcessing}
				<div
					class="absolute inset-0 flex flex-col items-center justify-center rounded-box bg-base-200/90"
				>
					Computing...
					<span class="loading loading-xl loading-spinner"></span>
				</div>
			{/if}
		</div>
	{/snippet}
</FloatingWindow>
