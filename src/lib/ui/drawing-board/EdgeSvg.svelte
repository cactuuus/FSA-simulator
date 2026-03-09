<script lang="ts">
	import { Edge } from '$lib/automata/models';
	import { GRAPH_GEOMETRY, getRegularEdgePath, getEdgeLabelPosition } from '$lib/automata/visuals';
	import ArrowMarkerSvg from './ArrowMarkerSvg.svelte';

	const { edge }: { edge: Edge } = $props();
	const shape = $derived(getRegularEdgePath(edge));
	const labelPosition = $derived(getEdgeLabelPosition(edge));
</script>

<g data-id={edge.id} data-fsa-item="edge" class="edge selectable">
	<defs>
		<ArrowMarkerSvg id="arrow-{edge.id}" size={GRAPH_GEOMETRY.arrowSize} classes="arrowhead" />
		<!-- separate marker for simulation overlay so it can be coloured independently -->
		<ArrowMarkerSvg
			id="arrow-{edge.id}-sim"
			size={GRAPH_GEOMETRY.arrowSize}
			classes="arrowhead simulation-arrowhead"
		/>
	</defs>

	<path d={shape} class="halo-stroke" />
	<path d={shape} class="edge-path" marker-end="url(#arrow-{edge.id})" />

	<!-- simulation overlay, invisible by default -->
	<path
		d={shape}
		class="simulation-overlay"
		marker-end="url(#arrow-{edge.id}-sim)"
		fill="none"
		opacity="0"
		pointer-events="none"
	/>

	<text class="edge-label" x={labelPosition.x} y={labelPosition.y}>
		{#each edge.transitions as transition, index (index)}
			<tspan
				data-id={transition.id}
				class="transition"
				x={labelPosition.x}
				dy={index === 0 ? 0 : GRAPH_GEOMETRY.labelLineHeight}
				dominant-baseline="middle"
			>
				{transition.toString()}
			</tspan>
		{/each}
	</text>

	<path d={shape} class="select-area interaction-only" />
</g>
