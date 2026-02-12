<script lang="ts">
	import { Edge } from '$lib/automata/models';
	import { GRAPH_GEOMETRY, getRegularEdgePath, getEdgeLabelPosition } from '$lib/automata/visuals';
	import ArrowMarkerSvg from './ArrowMarkerSvg.svelte';

	const {
		edge,
		isSelected,
		isInSelectionArea
	}: { edge: Edge; isSelected: boolean; isInSelectionArea: boolean } = $props();
	const shape = $derived(getRegularEdgePath(edge));
	const labelPosition = $derived(getEdgeLabelPosition(edge));
</script>

<g
	data-id={edge.id}
	data-fsa-item="edge"
	class="edge selectable {isSelected ? 'selected' : ''}
		  {isInSelectionArea ? 'in-selection-area' : ''}"
>
	<defs>
		<ArrowMarkerSvg id="arrow-{edge.id}" size={GRAPH_GEOMETRY.arrowSize} classes="arrowhead" />
	</defs>

	<path d={shape} class="halo-stroke" />
	<path d={shape} class="edge-path" marker-end="url(#arrow-{edge.id})" />

	<text class="edge-label" x={labelPosition.x} y={labelPosition.y}>
		{#each edge.transitions as transition, index}
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

	<!-- hidden, thicker path, used for easier selection -->
	<path d={shape} class="select-area interaction-only" />
</g>
<!--
<path
	d="M {edge.sourcePoint.x} {edge.sourcePoint.y} L {edge.controlPoint.x} {edge.controlPoint
		.y} L {edge.targetPoint.x} {edge.targetPoint.y}"
	fill="none"
	stroke="pink"
	stroke-width="2"
	stroke-dasharray="5,5"
/>
<circle cx={edge.controlPoint.x} cy={edge.controlPoint.y} r="3" fill="red" />
-->
