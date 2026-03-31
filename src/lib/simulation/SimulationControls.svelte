<script lang="ts">
	import {
		Play,
		Pause,
		X,
		Settings,
		RefreshCcw,
		SkipBack,
		SkipForward,
		ChevronRight,
		ChevronLeft
	} from '@lucide/svelte';
	import { type SimulationController } from './SimulationController.svelte';
	import { portal } from '$lib/utils/portal';

	const { controller }: { controller: SimulationController } = $props();
	let adjustSettingsModal: HTMLDialogElement | null = $state(null);

	const WINDOW = 5; // number of input symbols to show around the current position
	const visibleInput = $derived.by(() => {
		const current = controller.currentGroup ?? 0;
		const start = Math.max(0, current - WINDOW);
		const end = Math.min(controller.input.length, start + WINDOW * 2 + 1);
		const adjustedStart = Math.max(0, end - (WINDOW * 2 + 1));
		return controller.input.slice(adjustedStart, end).map((symbol, i) => ({
			symbol,
			index: adjustedStart + i
		}));
	});
</script>

<div class="controls flex flex-row gap-2 px-2 py-1">
	<!-- Input display -->
	<div class="pointer-events-none flex gap-0 rounded-md bg-base-200 px-2 py-1">
		{#if controller.input.length === 0}
			<span class="text-base-content/70 italic">No input</span>
		{:else}
			{#if visibleInput[0]?.index > 0}
				<span class="text-base-content/40">...</span>
			{/if}
			{#each visibleInput as { symbol, index } (index)}
				{#if controller.currentGroup === null || index > controller.currentGroup}
					<span>{symbol}</span>
				{:else if index === controller.currentGroup}
					<span class="font-bold text-error underline">{symbol}</span>
				{:else}
					<span class="text-base-content/70 line-through">{symbol}</span>
				{/if}
				{index < controller.input.length - 1 ? ',' : ''}
			{/each}
			{#if visibleInput[visibleInput.length - 1]?.index < controller.input.length - 1}
				<span class="text-base-content/40">...</span>
			{/if}
		{/if}
	</div>

	<div class="divider m-0 divider-horizontal"></div>

	<!-- Step to start -->
	<button
		onclick={() => controller.toStart()}
		class="btn btn-square btn-soft btn-sm"
		title="To start"
		disabled={!controller.canStop}
	>
		<SkipBack class="h-4 w-4" />
	</button>

	<!-- Step backward -->
	<button
		onclick={() => controller.stepBackward()}
		class="btn btn-square btn-soft btn-sm"
		title="Step back"
		disabled={!controller.canStop}
	>
		<ChevronLeft class="h-4 w-4" />
	</button>

	<!-- Play / Pause -->
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
			disabled={!controller.canPlay}
		>
			<Play class="h-4 w-4" />
		</button>
	{/if}

	<!-- Step forward -->
	<button
		onclick={() => controller.stepForward()}
		class="btn btn-square btn-soft btn-sm"
		title="Step forward"
		disabled={!controller.canPlay}
	>
		<ChevronRight class="h-4 w-4" />
	</button>

	<!-- Step to end -->
	<button
		onclick={() => controller.toEnd()}
		class="btn btn-square btn-soft btn-sm"
		title="To end"
		disabled={!controller.canPlay}
	>
		<SkipForward class="h-4 w-4" />
	</button>

	<!-- Scrub bar -->
	<input
		type="range"
		min="0"
		max={controller.totalDuration}
		step="10"
		value={controller.currentTime}
		class="range w-32 self-center range-xs"
		oninput={(e) => controller.scrubTo(Number(e.currentTarget.value))}
	/>

	<div class="divider m-0 divider-horizontal"></div>

	<button
		class="btn btn-square btn-soft btn-sm"
		title="Adjust settings"
		onclick={() => adjustSettingsModal?.showModal()}
	>
		<Settings class="h-4 w-4" />
	</button>

	<button
		onclick={() => controller.endSimulation()}
		class="btn btn-sm btn-error"
		title="Stop & exit simulation"
	>
		<X class="h-4 w-4" />
		Exit
	</button>
</div>

<!-- Settings modal -->
<dialog bind:this={adjustSettingsModal} class="modal" use:portal>
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
						value={controller.settings.speed}
						oninput={(e) => controller.setSpeed(Number(e.currentTarget.value))}
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
