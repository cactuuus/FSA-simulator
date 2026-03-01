<script lang="ts">
	import { Play, Pause, SkipForward, SkipBack, X, Settings, RefreshCcw } from '@lucide/svelte';
	import type { SimulationController } from '$lib/interaction/SimulationController.svelte';

	const { onExit, controller }: { onExit: () => void; controller: SimulationController } = $props();
	let adjustSettingsModal: HTMLDialogElement | null = $state(null);

	$effect(() => {
		const duration = Math.round(800 / controller.settings.speed);
		document.documentElement.style.setProperty('--simulation-transition-duration', `${duration}ms`);
		return () => document.documentElement.style.removeProperty('--simulation-transition-duration');
	});
</script>

<div class="flex flex-row gap-2 rounded-box bg-base-100/95 px-2 py-1 shadow">
	<!-- Input progress display -->
	<div class="pointer-events-none flex gap-0 rounded-md bg-base-200 px-2 py-1">
		{#if controller.input.length === 0}
			<span class="text-base-content/70 italic">No input</span>
		{:else}
			{#each controller.input as symbol, index}
				{#if index < controller.currentStep.inputIndex}
					<span class="text-base-content/70 line-through">{symbol}</span>
				{:else if index === controller.currentStep.inputIndex}
					<span class="font-bold text-error underline">{symbol}</span>
				{:else}
					<span>{symbol}</span>
				{/if}
				{index < controller.input.length - 1 ? ',' : ''}
			{/each}
		{/if}
	</div>

	<div class="divider m-0 divider-horizontal"></div>

	{#if controller.isPlaying}
		<button
			onclick={() => controller.pause()}
			class="btn btn-square btn-sm btn-warning"
			title="Pause"
		>
			<Pause class="h-4 w-4" />
		</button>
	{:else}
		<button
			onclick={() => controller.play()}
			class="btn btn-square btn-sm btn-success"
			title="Play"
			disabled={!controller.canGoNext}
		>
			<Play class="h-4 w-4" />
		</button>
	{/if}

	<button
		onclick={() => controller.previous()}
		class="btn btn-square btn-soft btn-sm"
		title="Previous step"
		disabled={controller.isPlaying || !controller.canGoPrevious}
	>
		<SkipBack class="h-4 w-4" />
	</button>

	<button
		onclick={() => controller.next()}
		class="btn btn-square btn-soft btn-sm"
		title="Next step"
		disabled={controller.isPlaying || !controller.canGoNext}
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
		<X class="h-4 w-4" />
		Exit
	</button>
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
						<span class="label-text font-bold">{controller.settings.speed.toFixed(1)}x</span>
					</label>
					<input
						type="range"
						id="simulation-speed"
						min="0.5"
						max="10.0"
						bind:value={controller.settings.speed}
						class="range range-xs"
						step="0.1"
					/>
				</div>
				<div class="mt-4 flex justify-between">
					<button type="button" class="btn btn-warning" onclick={() => controller.resetSettings()}>
						<RefreshCcw class="h-4 w-4" />
						Reset Defaults
					</button>
					<button type="submit" class="btn">Close</button>
				</div>
			</form>
		</div>
	</div>
</dialog>
