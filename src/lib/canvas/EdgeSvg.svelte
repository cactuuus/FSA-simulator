<script lang="ts">
	import { Node, Edge } from '$lib/fsa';

	const { edge, isSelected }: { edge: Edge; isSelected: boolean } = $props();

	const dy = edge.targetPoint.y - edge.sourcePoint.y;
	const dx = edge.targetPoint.x - edge.sourcePoint.x;
</script>

<g data-id={edge.id}>
	<defs>
		<!-- A marker to be used as an arrowhead -->
		<marker
			id="arrow"
			viewBox="0 0 10 10"
			refX={Node.RADIUS}
			refY="5"
			markerWidth="7"
			markerHeight="7"
			orient="auto-start-reverse"
			fill="white"
		>
			<path d="M 0 0 L 10 5 L 0 10 z" />
		</marker>
	</defs>

	<path
		d={`M ${edge.sourcePoint.x} ${edge.sourcePoint.y} L ${edge.targetPoint.x} ${edge.targetPoint.y}`}
		class="edge"
		stroke="white"
		stroke-width="2"
		marker-end="url(#arrow)"
	/>
	<path
		d={`M ${edge.sourcePoint.x} ${edge.sourcePoint.y} L ${edge.targetPoint.x} ${edge.targetPoint.y}`}
		class="edge"
		stroke="white"
		stroke-width="30"
		opacity="0.2"
	/>
	{#if isSelected}
		<path
			d={`M ${edge.sourcePoint.x} ${edge.sourcePoint.y} L ${edge.targetPoint.x} ${edge.targetPoint.y}`}
			stroke="red"
			stroke-width="3"
			pointer-events="none"
		/>
	{/if}
</g>
