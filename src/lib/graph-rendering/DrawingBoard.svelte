<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { FSAGraph } from '$lib/automata-models';
	import { getGraphCSS } from '$lib/utils/graphStyle';
	import { Viewport } from '$lib/editor/viewport';
	import { type State } from '$lib/editor/states';
	import { SvgInputHandler } from './SvgInputHandler';
	import NodeSvg from './NodeSvg.svelte';
	import EdgeSvg from './EdgeSvg.svelte';
	import StartEdgeSvg from './StartEdgeSvg.svelte';
	import { setGraphElement } from '$lib/utils/graphEffects';

	const {
		fsa,
		viewport,
		currentState,
		overlay
	}: {
		fsa: FSAGraph;
		viewport: Viewport;
		currentState: State;
		overlay?: Snippet;
	} = $props();

	let drawingBoard: SVGSVGElement;
	let graphElement: SVGGElement;
	// svelte-ignore non_reactive_update
	// (svgInputManager does not need to be reactive)
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
				viewport.canvasSize = { width, height };
			});

			resizeObserver.observe(drawingBoard);
			return () => resizeObserver.disconnect();
		}
	});

	/**
	 * Initialize the SVG input handler on mount.
	 */
	onMount(() => {
		setGraphElement(graphElement);
		inputHandler = new SvgInputHandler(drawingBoard, fsa, () => currentState);
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
				viewport.zoomIn(towardsPoint);
			} else {
				viewport.zoomOut(towardsPoint);
			}
		} else {
			let deltaX = -e.deltaX;
			let deltaY = -e.deltaY;
			if (e.shiftKey) {
				// force horizontal scrolling
				deltaX = deltaY;
				deltaY = 0;
			}
			viewport.panBy(deltaX, deltaY);
		}
	}
</script>

<section class="h-full w-full border border-base-300">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- The drawing board isn't be keyboard accessible as it currently is -->
	<svg
		bind:this={drawingBoard}
		viewBox={viewport.viewBox}
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
		<g id="fsa-graph" bind:this={graphElement}>
			{#if fsa.startNode}
				<StartEdgeSvg startingNode={fsa.startNode} />
			{/if}

			{#each fsa.edges as edge (edge.id)}
				<EdgeSvg {edge} />
			{/each}

			{#each fsa.nodes as node (node.id)}
				<NodeSvg {node} />
			{/each}
		</g>

		<g id="overlay-group">
			{@render overlay?.()}
		</g>
	</svg>
</section>

<!-- adding styles needed for the graph (not the cleanest of things, but couldn't find any other way!) -->
<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<style>${getGraphCSS('themed')}</style>`}
</svelte:head>
