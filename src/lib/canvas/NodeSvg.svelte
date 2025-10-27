<script lang="ts">
	import { Node } from '$lib/fsa';

	const { node, isSelected }: { node: Node; isSelected: boolean } = $props();
</script>

<g data-id={node.id}>
	<circle cx={node.pos.x} cy={node.pos.y} r={Node.RADIUS} class="node" stroke-width="2" />
	<text
		x={node.pos.x}
		y={node.pos.y + 5}
		text-anchor="middle"
		font-size="16"
		font-weight="bold"
		font-family="monospace"
		fill="var(--canvas-node-text)"
		pointer-events="none"
		>{node.label}
	</text>
	{#if isSelected}
		<circle
			cx={node.pos.x}
			cy={node.pos.y}
			r={Node.RADIUS + 3}
			stroke="var(--canvas-selected-stroke)"
			fill="none"
			stroke-width="5"
			pointer-events="none"
		/>
	{/if}
</g>
