<script lang="ts">
	// Important note:
	// There is another similar event listener in DrawingBoard.svelte, handling zooming via mouse wheel. That one doesn't really belong here as it needs the context of the drawing itself, since it zooms towards a specific point in it.

	import { Viewport } from './Viewport.svelte';
	import { Plus, Minus } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { isTyping } from '$lib/utils/keyboard';

	const { viewport }: { viewport: Viewport } = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (isTyping(e)) return;
		if (e.ctrlKey && e.key === '=') {
			e.preventDefault();
			viewport.zoomIn();
		} else if (e.ctrlKey && e.key === '-') {
			e.preventDefault();
			viewport.zoomOut();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="flex h-10 items-center gap-0.5 rounded-box bg-base-100/95 px-3 py-2 text-sm shadow">
	<span class="mr-2">{viewport.prettyZoomLevel}</span>
	<button
		class="btn btn-square btn-ghost btn-xs"
		onclick={() => viewport.zoomIn()}
		aria-label="Zoom In"
		title="Zoom In (Ctrl + =)"
	>
		<Plus class="h-4 w-4" />
	</button>
	<button
		class="btn btn-square btn-ghost btn-xs"
		onclick={() => viewport.zoomOut()}
		aria-label="Zoom Out"
		title="Zoom Out (Ctrl + -)"
	>
		<Minus class="h-4 w-4" />
	</button>
</div>
