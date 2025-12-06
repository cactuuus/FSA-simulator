<script lang="ts">
	import NodeSvg from './NodeSvg.svelte';
	import EdgeSvg from './EdgeSvg.svelte';
	import StartEdgeSvg from './StartEdgeSvg.svelte';
	import DraftEdgeSvg from './DraftEdgeSvg.svelte';
	import { Node, Edge } from '$lib/automata/models';
	import type { EventContext } from '$lib/application/interaction';
	import { ViewportManager } from '$lib/application/managers';
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
				editor.viewportManager.canvasSize = { width, height };
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
	function getEventContext(e: PointerEvent | MouseEvent): EventContext {
		// Determine which FSA item (node/edge) was targeted, if any.
		// Does not use e.target as it behaves differently between touch and mouse events.
		const element = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-id]') ?? null;
		const elementId = element?.getAttribute('data-id') ?? null;
		const fsaItem = elementId ? editor.fsaGraph.getItemFromId(elementId) : null;

		// Get pointer position in SVG coordinates
		const pivot = svgElement.createSVGPoint();
		pivot.x = e.clientX;
		pivot.y = e.clientY;
		const pointerPos = pivot.matrixTransform(svgElement.getScreenCTM()?.inverse());

		return {
			event: e,
			node: fsaItem instanceof Node ? fsaItem : undefined,
			edge: fsaItem instanceof Edge ? fsaItem : undefined,
			isCanvas: fsaItem === null,
			pointerPos: pointerPos
		};
	}

	/**
	 * Handle mouse wheel events.
	 * Ctrl + Wheel to zoom in/out.
	 */
	function handleWheel(e: WheelEvent) {
		if (e.ctrlKey) {
			e.preventDefault();
			const zoomAmount =
				e.deltaY < 0 ? ViewportManager.CANVAS_ZOOM_STEP : -ViewportManager.CANVAS_ZOOM_STEP;
			editor.viewportManager.adjustZoom(zoomAmount, getEventContext(e).pointerPos);
		}
	}

	function handlePointerDown(e: PointerEvent) {
		// ignore non-left clicks (mouse) and secondary touch points (touch)
		if (e.button !== 0 || !e.isPrimary) return;
		editor.stateManager.currentState?.handlePointerDown(getEventContext(e));
	}

	function handlePointerUp(e: PointerEvent) {
		// ignore non-left clicks (mouse) and secondary touch points (touch)
		if (e.button !== 0 || !e.isPrimary) return;
		editor.stateManager.currentState?.handlePointerUp(getEventContext(e));
	}

	function handlePointerMove(e: PointerEvent) {
		editor.stateManager.currentState?.handlePointerMove(getEventContext(e));
	}

	function handlePointerOver(e: PointerEvent) {
		editor.stateManager.currentState?.handlePointerOver(getEventContext(e));
	}

	function handlePointerOut(e: PointerEvent) {
		editor.stateManager.currentState?.handlePointerOut(getEventContext(e));
	}

	function handleDoubleClick(e: MouseEvent) {
		editor.stateManager.currentState?.handleDoubleClick(getEventContext(e));
	}
</script>

<section class="h-full w-full border border-base-300 bg-base-200">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_mouse_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- Ignore the above warnings. For now, the drawing board won't be keyboard accessible.-->
	<svg
		bind:this={svgElement}
		viewBox={editor.viewportManager.viewBox}
		id="fsa-diagram"
		class="h-full w-full touch-none"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointerover={handlePointerOver}
		onpointerout={handlePointerOut}
		onwheel={handleWheel}
		ondblclick={handleDoubleClick}
		data-state={editor.stateManager.currentState?.name}
	>
		<!--
			Note: SVG renders elements in the order they appear in the code.
		 -->
		{#if editor.fsaGraph.startNode}
			<StartEdgeSvg startingNode={editor.fsaGraph.startNode} />
		{/if}

		{#each editor.fsaGraph.edges as edge (edge.id)}
			<EdgeSvg {edge} isSelected={editor.selectionManager.isSelected(edge)} />
		{/each}

		{#if editor.draftEdge}
			<DraftEdgeSvg draftEdge={editor.draftEdge} />
		{/if}

		{#each editor.fsaGraph.nodes as node (node.id)}
			<NodeSvg {node} isSelected={editor.selectionManager.isSelected(node)} />
		{/each}
	</svg>
</section>
