<script lang="ts">
	import { Node } from '$lib/automata/models';
	import { GRAPH_GEOMETRY } from '$lib/automata/visuals';

	const { node, extraClass = '' }: { node: Node; extraClass?: string } = $props();
</script>

<g data-id={node.id} data-fsa-item="node" class="node selectable {extraClass}">
	<circle class="halo-stroke" cx={node.pos.x} cy={node.pos.y} r={GRAPH_GEOMETRY.nodeRadius} />
	<circle class="node-path" cx={node.pos.x} cy={node.pos.y} r={GRAPH_GEOMETRY.nodeRadius} />
	{#if node.isAccepting}
		<circle
			class="accepting-circle"
			cx={node.pos.x}
			cy={node.pos.y}
			r={GRAPH_GEOMETRY.acceptingNodeRadius}
		/>
	{/if}
	<text class="node-label" dominant-baseline="middle" x={node.pos.x} y={node.pos.y}>
		{node.label}
	</text>
</g>
