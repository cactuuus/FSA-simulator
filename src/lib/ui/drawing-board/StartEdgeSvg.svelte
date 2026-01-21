<script lang="ts">
	import { Node } from '$lib/automata/models';
	import { getStartEdgePath, GRAPH_GEOMETRY } from '$lib/automata/visuals';
	import ArrowMarkerSvg from './ArrowMarkerSvg.svelte';

	const { startingNode }: { startingNode: Node } = $props();
</script>

<!-- Arrow indicating starting node -->
<g data-id="start-edge" class="edge">
	<defs>
		<ArrowMarkerSvg id="arrow-start" size={GRAPH_GEOMETRY.arrowSize} />
	</defs>

	<path d={getStartEdgePath(startingNode.pos)} class="line" marker-end="url(#arrow-start)" />
</g>
