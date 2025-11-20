<script lang="ts">
	import NodeSvg from './NodeSvg.svelte';
	import EdgeSvg from './EdgeSvg.svelte';
	import StartEdgeSvg from './StartEdgeSvg.svelte';
	import DraftEdgeSvg from './DraftEdgeSvg.svelte';
	import { Node, Edge } from '$lib/fsa';
	import type { EventContext } from '$lib/state-machine';
	import { editor } from '$lib/stores/editor.svelte';

	let svgElement: SVGSVGElement;

	/**
	 * Observe size changes of the SVG element to update viewport size.
	 * This allows the viewBox to adapt when the drawing board is resized, without distorting or
	 * scaling the content.
	 */
	$effect(() => {
		if (svgElement) {
			const resizeObserver = new ResizeObserver((entries) => {
				const { width, height } = entries[0].contentRect;
				editor.canvasSize = { width, height };
			});

			resizeObserver.observe(svgElement);
			return () => resizeObserver.disconnect();
		}
	});

	/**
	 * Get the context of a mouse event, including which FSA item (if any) was targeted.
	 * The mouse position (mousePos) is given in SVG coordinates. The actual mouse position
	 * (relative to the viewport) can be accessed via the event object ({ e.clientX, e.clientY }).
	 */
	function getEventContext(e: MouseEvent): EventContext {
		const element = (e.target as Element).closest('[data-id]');
		const elementId = element?.getAttribute('data-id') ?? null;
		const fsaItem = elementId ? editor.fsaGraph.getItemFromId(elementId) : null;

		// Get mouse position in SVG coordinates
		const pivot = svgElement.createSVGPoint();
		pivot.x = e.clientX;
		pivot.y = e.clientY;
		const mousePos = pivot.matrixTransform(svgElement.getScreenCTM()?.inverse());

		return {
			event: e,
			node: fsaItem instanceof Node ? fsaItem : undefined,
			edge: fsaItem instanceof Edge ? fsaItem : undefined,
			isCanvas: fsaItem === null,
			mousePos: mousePos
		};
	}

	/**
	 * Handle mouse wheel events.
	 * Ctrl + Wheel to zoom in/out.
	 */
	function handleWheel(e: WheelEvent) {
		if (e.ctrlKey) {
			e.preventDefault();
			const zoomAmount = e.deltaY < 0 ? editor.CANVAS_ZOOM_STEP : -editor.CANVAS_ZOOM_STEP;
			editor.adjustZoom(zoomAmount, getEventContext(e).mousePos);
		}
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
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_mouse_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- Ignore the above warnings. For now, the drawing board won't be keyboard accessible.-->
	<svg
		bind:this={svgElement}
		viewBox={editor.viewBox}
		id="fsa-diagram"
		class="h-full w-full"
		onclick={handleClick}
		onmousedown={handleMouseDown}
		onmouseup={handleMouseUp}
		onmousemove={handleMouseMove}
		onmouseover={handleMouseOver}
		onmouseout={handleMouseOut}
		onwheel={handleWheel}
		data-state={editor.stateManager.currentState?.name}
	>
		<!--
			Note: SVG renders elements in the order they appear in the code.
		 -->
		{#if editor.fsaGraph.startNode}
			<StartEdgeSvg startingNode={editor.fsaGraph.startNode} />
		{/if}

		{#each editor.fsaGraph.edges as edge (edge.id)}
			<EdgeSvg {edge} isSelected={editor.isSelected(edge)} />
		{/each}

		{#if editor.draftEdge}
			<DraftEdgeSvg draftEdge={editor.draftEdge} />
		{/if}

		{#each editor.fsaGraph.nodes as node (node.id)}
			<NodeSvg {node} isSelected={editor.isSelected(node)} />
		{/each}
	</svg>
</section>
