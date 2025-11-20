<script lang="ts">
	import { Node, Edge } from '$lib/fsa';

	const { edge, isSelected }: { edge: Edge; isSelected: boolean } = $props();

	const shape = $derived(
		edge.isLoopback()
			? `M ${edge.sourcePoint.x - 30} ${edge.sourcePoint.y + 30}
			A 40 40, 0, 1, 0, ${edge.sourcePoint.x + 30} ${edge.sourcePoint.y + 30}
			L ${edge.sourcePoint.x} ${edge.sourcePoint.y}`
			: `M ${edge.sourcePoint.x} ${edge.sourcePoint.y}
			L ${edge.targetPoint.x} ${edge.targetPoint.y}`
	);

	const labelPosition = $derived(
		edge.isLoopback()
			? { x: edge.sourcePoint.x, y: edge.sourcePoint.y + Node.RADIUS + 80 }
			: {
					x: (edge.sourcePoint.x + edge.targetPoint.x) / 2,
					y: (edge.sourcePoint.y + edge.targetPoint.y) / 2
				}
	);

	const labelOffset = 4;
	const textSpacing = 20;
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

	<path d={shape} class="edge-path" marker-end="url(#arrow-{edge.id})" />

	<text class="edge-label" x={labelPosition.x} y={labelPosition.y}>
		{#each edge.label as label, index}
			<tspan x={labelPosition.x} dy={index === 0 ? labelOffset : textSpacing}>
				{label}
			</tspan>
		{/each}
	</text>

	<!-- hidden, thicker path, used for easier selection -->
	<path d={shape} class="select-area" />
</g>
