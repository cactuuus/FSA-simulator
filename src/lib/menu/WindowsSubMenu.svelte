<script lang="ts">
	import { Check, MousePointer2, Table2, MonitorCog, Info } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { WINDOWS_ID } from '$lib/windows';

	const WINDOW_ITEMS = [
		{ id: WINDOWS_ID.Selection, label: 'Selection panel', icon: MousePointer2 },
		{ id: WINDOWS_ID.TransitionTable, label: 'Transition table', icon: Table2 },
		{ id: WINDOWS_ID.ComputeInput, label: 'Compute input', icon: MonitorCog },
		{ id: WINDOWS_ID.GraphInfo, label: 'Graph info', icon: Info }
	] as const;

	async function toggleWindow(id: string) {
		if (app.windows.isOpen(id)) {
			app.windows.close(id);
		} else {
			app.windows.open(id);
		}
	}
</script>

<h2 class="menu-title">Windows</h2>
<ul>
	{#each WINDOW_ITEMS as item (item.id)}
		{@const isOpen = app.windows.isOpen(item.id)}
		<li>
			<button onclick={() => toggleWindow(item.id)} class="flex items-center justify-between">
				<span class="flex items-center gap-2">
					<item.icon class="h-4 w-4" />
					{item.label}
				</span>
				{#if isOpen}
					<Check class="h-3.5 w-3.5 text-success" />
				{/if}
			</button>
		</li>
	{/each}
</ul>
