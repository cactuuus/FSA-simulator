<script lang="ts">
	import { Node, Edge } from '$lib/fsa';

	const { edge, isSelected }: { edge: Edge; isSelected: boolean } = $props();
	const shape = $derived(
		`M ${edge.sourcePoint.x} ${edge.sourcePoint.y} L ${edge.targetPoint.x} ${edge.targetPoint.y}`
	);
</script>

<g data-id={edge.id} class="edge selectable {isSelected ? 'selected' : ''}">
	<defs>
		<!-- A marker to be used as an arrowhead -->
		<marker
			id="arrow-{edge.id}"
			viewBox="0 0 10 10"
			refX={Node.RADIUS}
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

	<path d={shape} class="line" marker-end="url(#arrow-{edge.id})" />

	<!-- hidden, thicker path, used for easier selection -->
	<path d={shape} class="select-area" />
</g>
