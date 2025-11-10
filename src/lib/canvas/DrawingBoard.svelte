<script lang="ts">
	import NodeSvg from './NodeSvg.svelte';
	import EdgeSvg from './EdgeSvg.svelte';
	import DraftEdgeSvg from './DraftEdgeSvg.svelte';
	import { Node, Edge } from '$lib/fsa';
	import type { EventContext } from '$lib/state-machine';
	import { editor } from '$lib/stores/editor.svelte';

	let svgElement: SVGSVGElement;

	function getEventContext(e: MouseEvent): EventContext {
		const element = (e.target as Element).closest('[data-id]');
		const elementId = element?.getAttribute('data-id') ?? null;
		const fsaItem = elementId ? editor.fsaGraph.getItemFromId(elementId) : null;

		return {
			event: e,
			node: fsaItem instanceof Node ? fsaItem : undefined,
			edge: fsaItem instanceof Edge ? fsaItem : undefined,
			isCanvas: fsaItem === null,
			mousePos: { x: e.offsetX, y: e.offsetY }
		};
	}

	function handleClick(e: MouseEvent) {
		editor.stateManager.currentState?.handleClick(getEventContext(e));
	}

	function handleMouseDown(e: MouseEvent) {
		editor.stateManager.currentState?.handleMouseDown?.(getEventContext(e));
	}

	function handleMouseUp(e: MouseEvent) {
		editor.stateManager.currentState?.handleMouseUp?.(getEventContext(e));
	}

	function handleMouseMove(e: MouseEvent) {
		editor.stateManager.currentState?.handleMouseMove?.(getEventContext(e));
	}

	function handleMouseOver(e: MouseEvent) {
		editor.stateManager.currentState?.handleMouseOver?.(getEventContext(e));
	}

	function handleMouseOut(e: MouseEvent) {
		editor.stateManager.currentState?.handleMouseOut?.(getEventContext(e));
	}
</script>

<section class="h-full w-full rounded-box border border-base-300 bg-base-200">
	<!--
		svelte-ignore
		a11y_click_events_have_key_events
		a11y_no_static_element_interactions
	 	a11y_mouse_events_have_key_events

		Ignore the above warnings. For now, the drawing board won't be keyboard accessible.
	-->
	<svg
		bind:this={svgElement}
		id="fsa-diagram"
		class="h-full w-full"
		onclick={handleClick}
		onmousedown={handleMouseDown}
		onmouseup={handleMouseUp}
		onmousemove={handleMouseMove}
		onmouseover={handleMouseOver}
		onmouseout={handleMouseOut}
		data-state={editor.stateManager.currentState?.name}
	>
		{#if editor.draftEdge}
			<DraftEdgeSvg draftEdge={editor.draftEdge} />
		{/if}

		{#each editor.fsaGraph.edges as edge (edge.id)}
			<EdgeSvg {edge} isSelected={editor.isSelected(edge)} />
		{/each}
		{#each editor.fsaGraph.nodes as node (node.id)}
			<NodeSvg {node} isSelected={editor.isSelected(node)} />
		{/each}
	</svg>
</section>
