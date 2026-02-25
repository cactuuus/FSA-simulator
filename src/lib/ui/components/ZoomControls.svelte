<script lang="ts">
	import { Viewport } from '$lib/interaction';
	import { Plus, Minus } from '@lucide/svelte';

	const { viewport }: { viewport: Viewport } = $props();
</script>

<span class="mr-2">{viewport.prettyZoomLevel}</span>

<button
	class="btn btn-square btn-ghost btn-sm"
	onclick={() => viewport.zoomIn()}
	aria-label="Zoom In"
>
	<Plus class="h-4 w-4" />
</button>
<button
	class="btn btn-square btn-ghost btn-sm"
	onclick={() => viewport.zoomOut()}
	aria-label="Zoom Out"
>
	<Minus class="h-4 w-4" />
</button>
