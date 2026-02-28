<script lang="ts">
	import { Play, Pause, SkipForward, SkipBack, Square, Settings, RefreshCcw } from '@lucide/svelte';
	import type {
		ComputationTree,
		ComputationNode,
		ComputationStep,
		StepType
	} from '$lib/automata/analisys';

	const { onExit, computationTree }: { onExit: () => void; computationTree: ComputationTree } =
		$props();

	interface SimulationSettings {
		speed: number;
	}

	const DEFAULT_SETTINGS: SimulationSettings = { speed: 1 };
	let adjustSettingsModal: HTMLDialogElement | null = $state(null);
	let isPlaying: boolean = $state(false);
	let settings: SimulationSettings = $state({ ...DEFAULT_SETTINGS });
	let stepIndex: number = $state(0);

	const currentStep = $derived<ComputationStep>(computationTree.steps[stepIndex]);
	const activeNodes = $derived<ComputationNode[]>(currentStep?.activeNodes ?? []);
	const canGoNext = $derived(stepIndex < computationTree.steps.length - 1);
	const canGoPrevious = $derived(stepIndex > 0);

	let playInterval: ReturnType<typeof setInterval> | null = null;

	function next() {
		if (canGoNext) stepIndex++;
	}

	function previous() {
		if (canGoPrevious) stepIndex--;
	}

	function getStepLabel(type: StepType): string {
		switch (type) {
			case 'start':
				return 'Initialization';
			case 'consume-symbol':
				return `Reading symbol '${computationTree.input[currentStep.inputIndex]}'`;
			case 'epsilon-closure':
				return 'Computing ε-closure';
			default:
				return type;
		}
	}

	$effect(() => {
		if (isPlaying) {
			playInterval = setInterval(() => {
				if (canGoNext) {
					next();
				} else {
					isPlaying = false;
				}
			}, 1000 / settings.speed);
		} else {
			if (playInterval) clearInterval(playInterval);
		}
		return () => {
			if (playInterval) clearInterval(playInterval);
		};
	});
</script>

<div class="flex flex-row gap-2 rounded-box bg-base-100/95 px-2 py-1 shadow">
	<!-- Input progress display -->
	<div class="pointer-events-none flex gap-0 rounded-md bg-base-200 px-2 py-1">
		{#each computationTree.input as symbol, index}
			{#if index < currentStep.inputIndex}
				<span class="text-base-content/70 line-through">{symbol}</span>
			{:else if index === currentStep.inputIndex}
				<span class="font-bold text-error underline">{symbol}</span>
			{:else}
				<span>{symbol}</span>
			{/if}
			{index < computationTree.input.length - 1 ? ',' : ''}
		{/each}
	</div>

	<div class="divider m-0 divider-horizontal"></div>

	{#if isPlaying}
		<button
			onclick={() => (isPlaying = false)}
			class="btn btn-square btn-sm btn-warning"
			title="Pause"
		>
			<Pause class="h-4 w-4" />
		</button>
	{:else}
		<button
			onclick={() => (isPlaying = true)}
			class="btn btn-square btn-sm btn-success"
			title="Play"
		>
			<Play class="h-4 w-4" />
		</button>
	{/if}

	<button
		onclick={previous}
		class="btn btn-square btn-soft btn-sm"
		title="Previous step"
		disabled={isPlaying || !canGoPrevious}
	>
		<SkipBack class="h-4 w-4" />
	</button>

	<button
		onclick={next}
		class="btn btn-square btn-soft btn-sm"
		title="Next step"
		disabled={isPlaying || !canGoNext}
	>
		<SkipForward class="h-4 w-4" />
	</button>

	<div class="divider m-0 divider-horizontal"></div>

	<button
		class="btn btn-square btn-soft btn-sm"
		title="Adjust settings"
		onclick={() => adjustSettingsModal?.showModal()}
	>
		<Settings class="h-4 w-4" />
	</button>

	<button onclick={onExit} class="btn btn-sm btn-error" title="Stop & exit simulation">
		<Square class="h-4 w-4" />
		Exit
	</button>

	<!-- TODO -- remove label from here, find better place for it -->
	<div class="divider m-0 divider-horizontal"></div>

	<!-- Current step label -->
	<span class="flex items-center px-1 text-xs text-base-content/70">
		{getStepLabel(currentStep.type)}
	</span>
</div>

<!-- Adjust settings modal -->
<dialog id="adjust-settings-modal" bind:this={adjustSettingsModal} class="modal">
	<div class="modal-box w-11/12 max-w-sm">
		<h3 class="text-lg font-bold">Simulation Settings</h3>
		<div class="modal-action mt-4">
			<form class="w-full" method="dialog">
				<div class="w-full max-w-xs">
					<label for="simulation-speed" class="label flex justify-between">
						<span class="label-text">Speed</span>
						<span class="label-text font-bold">{settings.speed.toFixed(1)}x</span>
					</label>
					<input
						type="range"
						id="simulation-speed"
						min="0.5"
						max="5"
						bind:value={settings.speed}
						class="range range-xs"
						step="0.2"
					/>
				</div>
				<div class="mt-4 flex justify-between">
					<button
						type="button"
						class="btn btn-warning"
						onclick={() => (settings = { ...DEFAULT_SETTINGS })}
					>
						<RefreshCcw class="h-4 w-4" />
						Reset Defaults
					</button>
					<button type="submit" class="btn">Close</button>
				</div>
			</form>
		</div>
	</div>
</dialog>
