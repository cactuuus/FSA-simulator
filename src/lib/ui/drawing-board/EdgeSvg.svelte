<script lang="ts">
	import { Edge } from '$lib/automata/models';
	import { getRegularEdgePath, getEdgeLabelPosition } from '$lib/utils';
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
	class="edge selectable {isSelected ? 'selected' : ''}
		  {isInSelectionArea ? 'in-selection-area' : ''}"
>
	<defs>
		<ArrowMarkerSvg id="arrow-{edge.id}" />
	</defs>

	<path d={shape} class="edge-path" marker-end="url(#arrow-{edge.id})" />

	<text class="edge-label" x={labelPosition.x} y={labelPosition.y}>
		{#each edge.label as label, index}
			<tspan x={labelPosition.x} dy={index === 0 ? 0 : Edge.LINE_HEIGHT} dominant-baseline="middle">
				{label}
			</tspan>
		{/each}
	</text>

	<!-- hidden, thicker path, used for easier selection -->
	<path d={shape} class="select-area" />
</g>
