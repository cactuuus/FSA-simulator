<script lang="ts">
	import { SelectionManager } from '$lib/application/managers';
	import { type FSAItem, Node, Edge } from '$lib/automata/models';
	import NodeDetails from './NodeDetails.svelte';
	import EdgeDetails from './EdgeDetails.svelte';
	import { ChevronDown, Trash2 } from '@lucide/svelte';

	const { selectionManager }: { selectionManager: SelectionManager } = $props();
	const items: FSAItem[] = $derived(selectionManager.selectedItems);
	let showContent = $state(true);
</script>

<details
	bind:open={showContent}
	class="max-w-70 rounded-box bg-base-100/95 text-sm shadow duration-0"
>
	<summary
		class="flex h-10 flex-row-reverse items-center justify-between gap-2 px-3 py-2 font-semibold"
	>
		<ChevronDown
			class="h-4 w-4 transition-transform duration-300 {showContent ? 'rotate-180' : 'rotate-0'}"
		/>
		<span>Selection</span>
	</summary>

	<div class=" border-t border-base-300 px-3 py-2">
		{#if items.length === 0}
			<p class="text-center text-sm text-base-content/70">No item(s) selected</p>
		{:else if items.length === 1}
			{@const item = items[0]}
			{#if item instanceof Node}
				<NodeDetails node={item} />
			{:else if item instanceof Edge}
				<EdgeDetails edge={item} />
			{/if}
			<hr class="my-4 border-base-content/70" />
			<button
				class="btn w-full btn-sm btn-error"
				onclick={() => selectionManager.deleteSelectedItems()}
			>
				<Trash2 class="h-4 w-4" /> Delete Item
			</button>
		{:else}
			<ul class="flex max-h-120 flex-col gap-4 overflow-y-auto">
				{#each items as item, index}
					{#if item instanceof Node}
						<li class="flex items-end justify-end gap-1">
							<span class="font-semibold">[{index + 1}]</span>
							<span class="mr-6 flex-1">Node</span>
							<span class="badge font-bold badge-info">{item.label}</span>
						</li>
					{:else if item instanceof Edge}
						<li class="flex items-end justify-end gap-1">
							<span class="font-semibold">[{index + 1}]</span>
							<span class="mr-6 flex-1">Edge</span>
							<span class="badge font-bold badge-info">{item.from.label}</span>
							⟶
							<span class="badge font-bold badge-info">{item.to.label}</span>
						</li>
					{/if}
				{/each}
			</ul>
			<hr class="my-4 border-base-content/70" />
			<button
				class="btn w-full btn-sm btn-error"
				onclick={() => selectionManager.deleteSelectedItems()}
			>
				<Trash2 class="h-4 w-4" /> Delete {items.length} Items
			</button>
		{/if}
	</div>
</details>
