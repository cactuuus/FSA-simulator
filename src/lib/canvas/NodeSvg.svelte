<script lang="ts">
	import { Node } from '$lib/fsa';

	const { node, isSelected }: { node: Node; isSelected: boolean } = $props();
</script>

<g data-id={node.id} class="node {isSelected ? 'selected' : ''} selectable">
	<circle cx={node.pos.x} cy={node.pos.y} r={Node.RADIUS} />
	<text x={node.pos.x} y={node.pos.y + 5}>{node.label} </text>
</g>
