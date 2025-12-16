<script lang="ts">
	import { Node } from '$lib/automata/models';

	const {
		node,
		isSelected,
		isInSelectionArea
	}: { node: Node; isSelected: boolean; isInSelectionArea: boolean } = $props();
	const textOffsetY = 5; // Vertical adjustment for text inside the node
	const acceptingCircleDiff = -5; // Difference in radius for accepting state circle
</script>

<g
	data-id={node.id}
	class="node {isSelected ? 'selected' : ''}
		   {isInSelectionArea ? 'in-selection-area' : ''} selectable"
>
	<circle cx={node.pos.x} cy={node.pos.y} r={Node.RADIUS} />
	{#if node.isAccepting}
		<circle
			cx={node.pos.x}
			cy={node.pos.y}
			r={Node.RADIUS + acceptingCircleDiff}
			class="accepting-circle"
		/>
	{/if}
	<text x={node.pos.x} y={node.pos.y + textOffsetY}>{node.label} </text>
</g>
