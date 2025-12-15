<script lang="ts">
	import NodeSvg from './NodeSvg.svelte';
	import EdgeSvg from './EdgeSvg.svelte';
	import StartEdgeSvg from './StartEdgeSvg.svelte';
	import DraftEdgeSvg from './DraftEdgeSvg.svelte';
	import { SvgInputManager, ViewportManager } from '$lib/application/managers';
	import type { EditorManager } from '$lib/application/managers/EditorManager.svelte';
	import { onMount } from 'svelte';

	const { editor }: { editor: EditorManager } = $props();
	let svgElement: SVGSVGElement;
	// svelte-ignore non_reactive_update - svgInputManager does not need to be reactive
	let svgInputManager: SvgInputManager;

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
	 * Initialize the SVG input manager on mount.
	 */
	onMount(() => {
		svgInputManager = new SvgInputManager(svgElement, editor.fsaGraph, () => editor.currentState);
	});

	/**
	 * Handle mouse wheel events.
	 * Ctrl + Wheel to zoom in/out.
	 */
	function handleWheel(e: WheelEvent) {
		if (e.ctrlKey) {
			e.preventDefault();
			const zoomAmount =
				e.deltaY < 0 ? ViewportManager.CANVAS_ZOOM_STEP : -ViewportManager.CANVAS_ZOOM_STEP;
			editor.viewportManager.adjustZoom(zoomAmount, svgInputManager.getPointerPosFromEvent(e));
		}
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
		onpointerdown={svgInputManager.handlePointerDown.bind(svgInputManager)}
		onpointermove={svgInputManager.handlePointerMove.bind(svgInputManager)}
		onpointerup={svgInputManager.handlePointerUp.bind(svgInputManager)}
		ondblclick={svgInputManager.handleDoubleClick.bind(svgInputManager)}
		onwheel={handleWheel}
		data-state={editor.currentState?.name}
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

		{#if editor.draftEdgeManager.draftEdge}
			<DraftEdgeSvg draftEdge={editor.draftEdgeManager.draftEdge} />
		{/if}

		{#each editor.fsaGraph.nodes as node (node.id)}
			<NodeSvg {node} isSelected={editor.selectionManager.isSelected(node)} />
		{/each}
	</svg>
</section>
