<script lang="ts">
	// TODO: remove dependency on app
	import { app } from '$lib/stores/app.svelte';
	import { Info, TriangleAlert, Check, RefreshCcw, CircleX, BookOpen } from '@lucide/svelte';
	import { WINDOWS_ID, FloatingWindow } from '$lib/windows';
	import { notifyWarning, notifyError } from '$lib/utils/notifications';
	import { FSAType, Transition } from '$lib/automata-models';
	import PathList from './PathList.svelte';
	import { type PathLeaf } from './computationTree';
	import { MANUAL_SECTIONS, manualHref } from '$lib/utils/manual';
	import { onMount } from 'svelte';
	import { prettyInputAlphabet } from '$lib/utils/prettyAlphabet';

	const controller = $derived(app.simulationController);
	let inputToProcess = $state<string>('');
	let isProcessing = $state<boolean>(false);
	let maxLoopsIterations = $state<number>(0);
	const alphabetIsSingleChar = $derived<boolean>(
		[...app.fsaGraph.alphabet()].every((s) => s.length === 1)
	);
	const cleanedInput = $derived.by<string[]>(() => {
		// handle empty input case, which would otherwise return [''] for non-single-char alphabets
		if (inputToProcess.trim() === '') return [];
		const separator = alphabetIsSingleChar ? '' : ',';
		return inputToProcess
			.trim()
			.split(separator)
			.map((s) => s.trim());
	});
	const canProcessInput = $derived.by<{ result: boolean; errors?: string[] }>(() => {
		const errors: string[] = [];
		if (cleanedInput.some((s) => s === '') && inputToProcess.length > 0) {
			errors.push(
				alphabetIsSingleChar
					? 'Input contains empty symbols, please remove any extra spaces.'
					: 'Input contains empty symbols, please remove any extra commas.'
			);
		}
		if (cleanedInput.some((s) => !app.fsaGraph.alphabet().has(s))) {
			errors.push("Input contains symbols that are not in the FSA's alphabet.");
		}
		if (!app.fsaGraph.hasStart) {
			errors.push('The graph has no start state, it cannot process any input.');
		}
		return { result: errors.length === 0, errors };
	});
	const paths = $derived.by<{ computed: boolean; accepting: PathLeaf[]; rejecting: PathLeaf[] }>(
		() => {
			if (!controller.tree) return { computed: false, accepting: [], rejecting: [] };
			const allPathsLeaves = controller.pathsLeaves;
			return {
				computed: true,
				accepting: allPathsLeaves.filter((p) => p.isAccepting),
				rejecting: allPathsLeaves.filter((p) => !p.isAccepting)
			};
		}
	);

	async function runInputComputation(cleanedInput: string[]): Promise<void> {
		if (!canProcessInput.result) {
			canProcessInput.errors?.forEach((error) => notifyWarning(error));
			return;
		}
		try {
			isProcessing = true;
			controller.computeInput(app.fsaGraph, cleanedInput, maxLoopsIterations);
		} catch (error: unknown) {
			console.error('Failed to compute input:', error);
			notifyError(
				'Failed to compute input, an unexpected error occurred. Check console for details.'
			);
		} finally {
			isProcessing = false;
		}
	}

	function startPathSimulation(leaf: PathLeaf): void {
		controller.startSimulation(leaf);
	}

	/**
	 * Close the windows and resets the simulation. This is in order to avoid extra computation and memory used by the simulation controller (such as tracking changes to the FSA) when the window is closed.
	 */
	function closeAndReset() {
		controller.reset();
		app.windows.close(WINDOWS_ID.ComputeInput);
	}

	onMount(() => {
		// initialize the input field with the current input from the controller, if any
		// useful to maintain state when entering/exiting the simulation
		inputToProcess = controller.input.join(alphabetIsSingleChar ? '' : ', ');
	});
</script>

<FloatingWindow
	id={WINDOWS_ID.ComputeInput}
	windowState={app.windows.open(WINDOWS_ID.ComputeInput)}
	onClose={closeAndReset}
	onFocus={() => app.windows.bringToFront(WINDOWS_ID.ComputeInput)}
	defaultWidth={500}
>
	{#snippet header()}
		<span class="flex items-center gap-2">
			Compute Input
			<a
				href={manualHref(MANUAL_SECTIONS.SIMULATION)}
				target="_blank"
				rel="noopener noreferrer"
				class="text-primary hover:text-secondary"
				title="Open manual section about simulation"
			>
				<BookOpen class="h-4 w-4" />
			</a>
		</span>
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
					placeholder={Transition.EPSILON}
					class="input input-sm w-full max-w-xs"
					bind:value={inputToProcess}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							runInputComputation(cleanedInput);
						}
					}}
				/>
				<div class="flex justify-end gap-2">
					<button class="btn btn-sm btn-success" onclick={() => runInputComputation(cleanedInput)}>
						Compute
					</button>
				</div>
			</div>

			<!-- Alphabet reminder -->
			<div class="text-sm text-base-content/70">
				<p>Input alphabet: {prettyInputAlphabet(app.fsaGraph)}</p>
			</div>

			{#if canProcessInput.errors}
				<ul class="flex list-inside flex-col gap-1">
					{#each canProcessInput.errors as error, index (index)}
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
			<h3 class=" flex gap-2 border-b border-base-content/30 font-semibold">
				Result:
				{#if paths.computed}
					{#if paths.accepting.length > 0}
						<span class="text-success">Accepted!</span>
					{:else if paths.rejecting.length > 0}
						<span class="text-error">Rejected!</span>
					{/if}
				{:else}
					<span class="text-base-content/70">—</span>
				{/if}
			</h3>
			{#if paths.computed}
				<!-- Warnings -->
				{#if controller.warnings.length > 0}
					<details class="collapse-arrow collapse rounded-box bg-warning/10 text-warning">
						<summary class="collapse-title p-2 font-semibold">
							<TriangleAlert class="inline h-4 w-4" />
							{controller.warnings.length} Warnings
						</summary>
						<div class="collapse-content">
							<ul class="list-inside list-disc text-sm">
								{#each controller.warnings as warning, index (index)}
									<li>{warning}</li>
								{/each}
							</ul>
						</div>
					</details>
				{/if}
				<!-- Accepting paths -->
				{#if paths.accepting.length > 0}
					<details class="collapse-arrow collapse rounded-box bg-success/10 text-success">
						<summary class="collapse-title p-2 font-semibold">
							<Check class="inline h-4 w-4" />
							{paths.accepting.length} Accepting Path{paths.accepting.length > 1 ? 's' : ''}
						</summary>
						<div class="collapse-content">
							<p class="mb-2 rounded-box text-xs text-base-content/70 italic">
								<Info class="inline h-3 w-3" />
								Click on a path to run a simulation of only the path itself.
							</p>
							<PathList
								leaves={paths.accepting}
								tree={controller.tree!}
								onClick={startPathSimulation}
							/>
						</div>
					</details>
				{/if}

				<!-- Rejecting paths -->
				{#if paths.rejecting.length > 0}
					<details class="collapse-arrow collapse rounded-box bg-error/10">
						<summary class="collapse-title p-2 font-semibold text-error">
							<CircleX class="inline h-4 w-4" />
							{paths.rejecting.length} Rejecting Path{paths.rejecting.length > 1 ? 's' : ''}
						</summary>
						<div class="collapse-content">
							<p class="mb-2 rounded-box text-xs text-base-content/70 italic">
								<Info class="inline h-3 w-3" />
								Click on a path to run a simulation of only the path itself.
							</p>
							<PathList
								leaves={paths.rejecting}
								tree={controller.tree!}
								onClick={startPathSimulation}
							/>
						</div>
					</details>
				{/if}

				<!-- Overlay to cover outdated results -->
				{#if controller.fsaHasChangedSince(app.fsaGraph)}
					<div
						class="absolute inset-0 flex flex-col items-center justify-center rounded-box bg-base-200/90"
					>
						<p class="mx-auto p-2 text-center">
							The FSA has changed since the last time the input was processed. <br />
							Re-compute to access updated results.
						</p>
						<button
							class="btn btn-sm btn-neutral"
							onclick={() => runInputComputation(controller.input)}
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
