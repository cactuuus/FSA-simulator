<script lang="ts">
	import { type FSAItem, type FSAGraph, Node, Edge } from '$lib/automata/models';
	import NodeDetails from './NodeDetails.svelte';
	import EdgeDetails from './EdgeDetails.svelte';

	const { item, fsa }: { item: FSAItem | null; fsa: FSAGraph } = $props();
	const itemType = $derived(item ? (item instanceof Node ? 'Node' : 'Edge') : 'None');
	let showContent = $state(true);
</script>

<details
	bind:open={showContent}
	class="collapse-arrow collapse rounded-box bg-base-100/95 shadow {showContent ? 'w-88' : 'w-12'}"
>
	<summary
		class="collapse-title flex min-h-12 items-baseline gap-4 border-b border-base-300 p-4 font-semibold"
	>
		{showContent ? 'Selected Item' : ''}
	</summary>

	<div class="collapse-content p-4">
		{#if item}
			{#if item instanceof Node}
				<NodeDetails node={item} {fsa} />
			{:else if item instanceof Edge}
				<EdgeDetails edge={item} />
			{/if}
			<hr class="my-6 border-base-content/70" />
			<button class="btn w-full btn-error" onclick={() => fsa.deleteItem(item)}>
				Delete {itemType}</button
			>
		{:else}
			<p class="text-center text-sm text-base-content/70">Nothing selected</p>
		{/if}
	</div>
</details>
