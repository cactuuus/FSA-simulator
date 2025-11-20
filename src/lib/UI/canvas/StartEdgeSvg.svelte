<script lang="ts">
	import { Node } from '$lib/fsa';

	const { startingNode }: { startingNode: Node } = $props();
	const length = 3 * Node.RADIUS;
</script>

<!-- Arrow indicating starting node -->
<g data-id="start-edge" class="edge">
	<marker
		id="arrow-start"
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
	<path
		d={`
            M ${startingNode.pos.x - length} ${startingNode.pos.y}
			L ${startingNode.pos.x} ${startingNode.pos.y}
        `}
		class="line"
		marker-end="url(#arrow-start)"
	/>
</g>
