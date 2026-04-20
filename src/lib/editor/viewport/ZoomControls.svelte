<script lang="ts">
	// Important note:
	// There is another similar event listener in DrawingBoard.svelte, handling zooming via mouse wheel. That one doesn't really belong here as it needs the context of the drawing itself, since it zooms towards a specific point in it.

	import { Viewport } from './Viewport.svelte';
	import { Plus, Minus, LocateFixed } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { isTyping } from '$lib/utils/keyboard';
	import type { FSAGraph } from '$lib/automata-models';
	import { notifyWarning } from '$lib/utils/notifications';

	const { viewport, fsa }: { viewport: Viewport; fsa: FSAGraph } = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (isTyping(e)) return;
		if (e.ctrlKey && e.key === '=') {
			e.preventDefault();
			viewport.zoomIn();
		} else if (e.ctrlKey && e.key === '-') {
			e.preventDefault();
			viewport.zoomOut();
		} else if (e.ctrlKey && e.key === '0') {
			e.preventDefault();
			centerOnAutomaton();
		}
	}

	function centerOnAutomaton() {
		if (fsa.nodes.length === 0) {
			notifyWarning('The automaton is empty, it has no nodes to center on!');
			return;
		}
		viewport.panTo(...fsa.nodes.map((n) => n.pos));
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="controls flex items-center gap-0.5 px-3 py-2 text-sm">
	<button
		class="btn btn-square btn-ghost btn-xs"
		onclick={centerOnAutomaton}
		aria-label="Center view (Ctrl + 0)"
		title="Center view (Ctrl + 0)"
	>
		<LocateFixed class="h-4 w-4" />
	</button>
	<div class="divider mx-0.5 divider-horizontal"></div>
	<span class="mr-2">{viewport.prettyZoomLevel}</span>
	<button
		class="btn btn-square btn-ghost btn-xs"
		onclick={() => viewport.zoomIn()}
		aria-label="Zoom In (Ctrl + =)"
		title="Zoom In (Ctrl + =)"
	>
		<Plus class="h-4 w-4" />
	</button>
	<button
		class="btn btn-square btn-ghost btn-xs"
		onclick={() => viewport.zoomOut()}
		aria-label="Zoom Out (Ctrl + -)"
		title="Zoom Out (Ctrl + -)"
	>
		<Minus class="h-4 w-4" />
	</button>
</div>
