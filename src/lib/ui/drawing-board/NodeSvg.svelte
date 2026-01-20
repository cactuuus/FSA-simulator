<script lang="ts">
	import { Node } from '$lib/automata/models';

	const {
		node,
		isSelected,
		isInSelectionArea
	}: { node: Node; isSelected: boolean; isInSelectionArea: boolean } = $props();
	const acceptingCircleDiff = -5; // Difference in radius for accepting state circle
</script>

<g
	data-id={node.id}
	class="node {isSelected ? 'selected' : ''}
		   {isInSelectionArea ? 'in-selection-area' : ''} selectable"
>
	<circle cx={node.pos.x} cy={node.pos.y} r={Node.RADIUS} class="halo-stroke" />
	<circle class="node-path" cx={node.pos.x} cy={node.pos.y} r={Node.RADIUS} />
	{#if node.isAccepting}
		<circle
			cx={node.pos.x}
			cy={node.pos.y}
			r={Node.RADIUS + acceptingCircleDiff}
			class="accepting-circle"
		/>
	{/if}
	<text class="node-label" dominant-baseline="middle" x={node.pos.x} y={node.pos.y}>
		{node.label}
	</text>
</g>
