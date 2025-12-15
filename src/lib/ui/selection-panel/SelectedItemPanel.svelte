<script lang="ts">
	import { SelectionManager } from '$lib/application/managers';
	import { type FSAItem, Node, Edge } from '$lib/automata/models';
	import NodeDetails from './NodeDetails.svelte';
	import EdgeDetails from './EdgeDetails.svelte';
	import { Trash2 } from '@lucide/svelte';

	const { selectionManager }: { selectionManager: SelectionManager } = $props();
	const items: FSAItem[] = $derived(selectionManager.selectedItems);
	let showContent = $state(true);
</script>

<details
	bind:open={showContent}
	class="collapse-arrow collapse rounded-box bg-base-100/95 shadow {showContent ? 'w-80' : 'w-12'}"
>
	<summary
		class="collapse-title flex min-h-12 items-baseline gap-4 border-b border-base-300 p-4 font-semibold"
	>
		{showContent ? 'Selected' : ''}
	</summary>

	<div class="collapse-content p-4">
		{#if items.length === 0}
			<p class="text-center text-sm text-base-content/70">Nothing selected</p>
		{:else if items.length === 1}
			{@const item = items[0]}
			{#if item instanceof Node}
				<NodeDetails node={item} fsa={selectionManager.fsaGraph} />
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
			<ul class="flex flex-col gap-4">
				{#each items as item}
					{#if item instanceof Node}
						<li class="flex items-center justify-end gap-1">
							<span class="flex-1">Node</span>
							<span class="badge font-bold badge-info">{item.label}</span>
						</li>
					{:else if item instanceof Edge}
						<li class="flex items-center justify-end gap-1">
							<span class="flex-1">Edge</span>
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
