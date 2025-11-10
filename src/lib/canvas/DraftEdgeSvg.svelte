<script lang="ts">
	import { DraftEdge, Node } from '$lib/fsa';

	const { draftEdge }: { draftEdge: DraftEdge } = $props();
</script>

<g data-id="draft-edge" class="draft-edge" pointer-events="none">
	<defs>
		<!-- arrowhead -->
		<marker
			id="draft-arrow"
			viewBox="0 0 10 10"
			refX={draftEdge.pointingAtNode ? Node.RADIUS : 10}
			refY="5"
			markerWidth="7"
			markerHeight="7"
			orient="auto-start-reverse"
			stroke="none"
			fill="currentColor"
		>
			<path d="M 0 0 L 10 5 L 0 10 z" />
		</marker>
	</defs>

	<path
		d={`M ${draftEdge.sourcePoint.x} ${draftEdge.sourcePoint.y}
            L ${draftEdge.targetPoint.x} ${draftEdge.targetPoint.y}`}
		class="line"
		marker-end="url(#draft-arrow)"
	/>
</g>
