<script lang="ts">
	import { Node } from '$lib/fsa';
	import ArrowMarkerSvg from './ArrowMarkerSvg.svelte';
	import { getStartEdgePath } from './edgeUtils';

	const { startingNode }: { startingNode: Node } = $props();
</script>

<!-- Arrow indicating starting node -->
<g data-id="start-edge" class="edge">
	<defs>
		<ArrowMarkerSvg id="arrow-start" />
	</defs>

	<path d={getStartEdgePath(startingNode.pos)} class="line" marker-end="url(#arrow-start)" />
</g>
