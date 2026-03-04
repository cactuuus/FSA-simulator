<script lang="ts">
	import { Node } from '$lib/automata/models';
	import { getStartEdgePath, GRAPH_GEOMETRY } from '$lib/automata/visuals';
	import ArrowMarkerSvg from './ArrowMarkerSvg.svelte';

	const { startingNode }: { startingNode: Node } = $props();

	const shape = $derived(getStartEdgePath(startingNode.pos));
</script>

<!-- Arrow indicating starting node -->
<g data-id="start-edge" class="edge" id="start-edge">
	<defs>
		<ArrowMarkerSvg id="arrow-start" size={GRAPH_GEOMETRY.arrowSize} classes="arrowhead" />
		<!-- separate marker for simulation overlay so it can be coloured independently -->
		<ArrowMarkerSvg
			id="arrow-start-sim"
			size={GRAPH_GEOMETRY.arrowSize}
			classes="arrowhead simulation-arrowhead"
		/>
	</defs>

	<path d={shape} class="edge-path" marker-end="url(#arrow-start)" />
	<!-- simulation overlay, invisible by default -->
	<path
		d={shape}
		class="simulation-overlay"
		marker-end="url(#arrow-start-sim)"
		fill="none"
		opacity="0"
		pointer-events="none"
	/>
</g>
