<script lang="ts">
	import { Edge } from '$lib/automata-models';
	import { getRegularEdgePath, getEdgeLabelPosition } from '$lib/utils/edgeUtils';
	import { GRAPH_GEOMETRY } from '$lib/utils/graphStyle';
	import { type Point } from '$lib/utils/geometry';
	import ArrowMarkerSvg from './ArrowMarkerSvg.svelte';

	const { edge }: { edge: Edge } = $props();
	const shape: string = $derived(getRegularEdgePath(edge));
	const labelPosition: Point = $derived(getEdgeLabelPosition(edge));
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
				class:duplicate={edge.duplicateTransitionIds.has(transition.id)}
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
