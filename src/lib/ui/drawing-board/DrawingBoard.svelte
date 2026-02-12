<script lang="ts">
	import { onMount } from 'svelte';
	import { app } from '$lib/stores/app.svelte';
	import { getGraphCSS } from '$lib/automata/visuals';
	import { SvgInputHandler } from '$lib/interaction';
	import NodeSvg from './NodeSvg.svelte';
	import EdgeSvg from './EdgeSvg.svelte';
	import StartEdgeSvg from './StartEdgeSvg.svelte';
	import DraftEdgeSvg from './DraftEdgeSvg.svelte';
	import SelectionArea from './SelectionArea.svelte';

	let drawingBoard: SVGSVGElement;
	// svelte-ignore non_reactive_update - svgInputManager does not need to be reactive
	let inputHandler: SvgInputHandler;

	/**
	 * Observe size changes of the SVG element to update viewport size.
	 * This allows the viewBox to adapt when the drawing board is resized, without distorting or
	 * scaling the content.
	 */
	$effect(() => {
		if (drawingBoard) {
			const resizeObserver = new ResizeObserver((entries) => {
				const { width, height } = entries[0].contentRect;
				app.viewport.canvasSize = { width, height };
			});

			resizeObserver.observe(drawingBoard);
			return () => resizeObserver.disconnect();
		}
	});

	/**
	 * Initialize the SVG input handler on mount.
	 */
	onMount(() => {
		inputHandler = new SvgInputHandler(drawingBoard, app.fsaGraph, () => app.editor.currentState);
	});

	/**
	 * Handle mouse wheel events.
	 * - Zoom in/out when Ctrl is pressed.
	 * - Pan otherwise, Shift forces horizontal panning.
	 */
	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (e.ctrlKey) {
			// Zooming in/out
			const towardsPoint = inputHandler.getPointerPosFromEvent(e);
			const direction = e.deltaY < 0 ? 1 : -1;
			if (direction > 0) {
				app.viewport.zoomIn(towardsPoint);
			} else {
				app.viewport.zoomOut(towardsPoint);
			}
		} else {
			let deltaX = -e.deltaX;
			let deltaY = -e.deltaY;
			if (e.shiftKey) {
				// force horizontal scrolling
				deltaX = deltaY;
				deltaY = 0;
			}
			app.viewport.panBy(deltaX, deltaY);
		}
	}
</script>

<section class="h-full w-full border border-base-300">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_mouse_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- Ignore the above warnings. For now, the drawing board won't be keyboard accessible.-->
	<svg
		bind:this={drawingBoard}
		viewBox={app.viewport.viewBox}
		id="drawing-board"
		class="h-full w-full touch-none"
		onpointerdown={inputHandler.handlePointerDown.bind(inputHandler)}
		onpointermove={inputHandler.handlePointerMove.bind(inputHandler)}
		onpointerup={inputHandler.handlePointerUp.bind(inputHandler)}
		ondblclick={inputHandler.handleDoubleClick.bind(inputHandler)}
		onwheel={handleWheel}
	>
		<!--
		Note: SVG renders elements in the order they appear in the code.
		-->
		<g id="fsa-graph">
			{#if app.fsaGraph.startNode}
				<StartEdgeSvg startingNode={app.fsaGraph.startNode} />
			{/if}

			{#each app.fsaGraph.edges as edge (edge.id)}
				<EdgeSvg
					{edge}
					isSelected={app.editor.selection.isSelected(edge.id)}
					isInSelectionArea={app.editor.selection.isInArea(edge)}
				/>
			{/each}

			{#each app.fsaGraph.nodes as node (node.id)}
				<NodeSvg
					{node}
					isSelected={app.editor.selection.isSelected(node.id)}
					isInSelectionArea={app.editor.selection.isInArea(node)}
				/>
			{/each}
		</g>

		<g id="overlay-group">
			{#if app.editor.draftEdge.get}
				<DraftEdgeSvg draftEdge={app.editor.draftEdge.get} />
			{/if}

			{#if app.editor.selection.area}
				{@const { start, end } = app.editor.selection.area}
				<SelectionArea {start} {end} />
			{/if}
		</g>
	</svg>
</section>

<!-- adding styles needed for the graph -->
<svelte:head>
	{@html `<style>${getGraphCSS('themed')}</style>`}
</svelte:head>
