<script lang="ts">
	import { DraftEdge } from '$lib/automata-models';
	import { getDraftEdgePath } from '$lib/utils/edgeUtils';
	import { GRAPH_GEOMETRY } from '$lib/utils/graphStyle';
	import ArrowMarkerSvg from '$lib/graph-rendering/ArrowMarkerSvg.svelte';

	const { draftEdge }: { draftEdge: DraftEdge } = $props();
</script>

<g
	data-id="draft-edge"
	class="draft-edge {draftEdge.isDuplicate ? 'invalid' : ''}"
	pointer-events="none"
>
	<defs>
		<ArrowMarkerSvg id="draft-arrow" size={GRAPH_GEOMETRY.arrowSize} />
	</defs>

	<path d={getDraftEdgePath(draftEdge)} class="line" marker-end="url(#draft-arrow)" />
</g>
