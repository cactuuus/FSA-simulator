<script lang="ts">
	import { DraftEdge } from '$lib/fsa';
	import { getDraftEdgePath } from '$lib/utils';
	import ArrowMarkerSvg from './ArrowMarkerSvg.svelte';

	const { draftEdge }: { draftEdge: DraftEdge } = $props();
</script>

<g
	data-id="draft-edge"
	class="draft-edge {draftEdge.isDuplicate ? 'invalid' : ''}"
	pointer-events="none"
>
	<defs>
		<ArrowMarkerSvg id="draft-arrow" />
	</defs>

	<path d={getDraftEdgePath(draftEdge)} class="line" marker-end="url(#draft-arrow)" />
</g>
