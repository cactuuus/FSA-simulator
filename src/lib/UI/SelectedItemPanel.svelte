<script lang="ts">
	import { type FSAItem, Node, Edge } from '$lib/fsa';
	import NodeDetails from './NodeDetails.svelte';
	import EdgeDetails from './EdgeDetails.svelte';

	const { item }: { item: FSAItem | null } = $props();
	let showContent = $state(true);
</script>

<details
	bind:open={showContent}
	class="collapse-arrow collapse w-72 rounded-2xl bg-base-100 shadow-lg"
>
	<summary class="collapse-title border-b border-base-300 p-4 font-semibold">
		Selected Item
	</summary>

	<div class="collapse-content p-4">
		{#if item instanceof Node}
			<NodeDetails node={item} />
		{:else if item instanceof Edge}
			<EdgeDetails edge={item} />
		{:else}
			<p class="text-center text-sm text-base-content/70">Nothing selected</p>
		{/if}
	</div>
</details>
