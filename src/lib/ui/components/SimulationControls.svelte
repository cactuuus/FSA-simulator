<script lang="ts">
	import { Play, Pause, SkipForward, SkipBack, Square, Settings } from '@lucide/svelte';

	const { onExit }: { onExit: () => void } = $props();
	const DEFAULT_SETTINGS = {
		speed: 1
	};
	let adjustSettingsModal = $state<HTMLDialogElement | null>(null);
	let isPlaying = $state(false);
	let settings = $state({ ...DEFAULT_SETTINGS });

	function adjustSettings() {
		adjustSettingsModal?.showModal();
	}

	function next() {
		console.log('Next');
	}

	function previous() {
		console.log('Previous');
	}
</script>

<div class="flex flex-row gap-2 rounded-box bg-base-100/95 px-2 py-1 shadow">
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
		disabled={isPlaying}
	>
		<SkipBack class="h-4 w-4" />
	</button>
	<button
		onclick={next}
		class="btn btn-square btn-soft btn-sm"
		title="Next step"
		disabled={isPlaying}
	>
		<SkipForward class="h-4 w-4" />
	</button>

	<div class="divider m-0 divider-horizontal"></div>

	<button class="btn btn-square btn-soft btn-sm" title="Adjust settings" onclick={adjustSettings}>
		<Settings class="h-4 w-4" />
	</button>

	<button onclick={onExit} class="btn btn-sm btn-error" title="Stop & exit simulation">
		<Square class="h-4 w-4" />
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
					<button type="button" class="btn" onclick={() => (settings = { ...DEFAULT_SETTINGS })}>
						Reset
					</button>
					<button type="submit" class="btn btn-success">Close</button>
				</div>
			</form>
		</div>
	</div>
</dialog>
