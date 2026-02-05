<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { type FSAItem, Node, Edge } from '$lib/automata/models';
	import { EditorManager } from '$lib/interaction/editor';
	import NodeDetails from './NodeDetails.svelte';
	import EdgeDetails from './EdgeDetails.svelte';

	const { editor }: { editor: EditorManager } = $props();
	const items: FSAItem[] = $derived(editor.selection.items);
</script>

<div class="mx-auto w-55 max-w-full">
	{#if items.length === 0}
		<p class="text-center text-sm text-base-content/70">No item(s) selected</p>
	{:else if items.length === 1}
		{@const item = items[0]}
		{#if item instanceof Node}
			<NodeDetails node={item} fsaGraph={editor.fsaGraph} />
		{:else if item instanceof Edge}
			<EdgeDetails edge={item} fsaGraph={editor.fsaGraph} commandHistory={editor.commandHistory} />
		{/if}
		<hr class="my-4 border-base-content/70" />
		<button class="btn w-full btn-sm btn-error" onclick={() => editor.selection.deleteAll()}>
			<Trash2 class="h-4 w-4" /> Delete Item
		</button>
	{:else}
		<button class="btn w-full btn-sm btn-error" onclick={() => editor.selection.deleteAll()}>
			<Trash2 class="h-4 w-4" /> Delete {items.length} Items
		</button>
	{/if}
</div>
