<script lang="ts">
	import { onMount } from 'svelte';
	import type { FSA, Point } from '$lib/fsa';
	import type { CanvasState } from '$lib/state-machine';
	import { canvasTheme as ct } from '$lib/canvas';

	let {
		fsa,
		state
	}: {
		fsa: FSA;
		state: CanvasState | null;
	} = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	function render() {
		if (!ctx) return;

		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Edges
		fsa.edges.forEach((edge) => {
			edge.draw(ctx);
		});
		fsa.draftEdge?.draw(ctx);

		// Nodes
		fsa.nodes.forEach((node) => {
			node.draw(ctx);
		});
	}

	onMount(() => {
		window.addEventListener('resize', render);
		ctx = canvas.getContext('2d')!;

		return () => {
			window.removeEventListener('resize', render);
		};
	});

	$effect(() => {
		ct.colorScheme; // create dependency on color scheme
		render();
	});

	function getCanvasPoint(e: MouseEvent): Point {
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}

	function handleMouseDown(e: MouseEvent) {
		state?.onMouseDown?.(getCanvasPoint(e));
		render();
	}
	function handleMouseMove(e: MouseEvent) {
		state?.onMouseMove?.(getCanvasPoint(e));
		render();
	}
	function handleMouseUp(e: MouseEvent) {
		state?.onMouseUp?.(getCanvasPoint(e));
		render();
	}
	function handleClick(e: MouseEvent) {
		state?.onClick?.(getCanvasPoint(e));
		render();
	}
</script>

<canvas
	bind:this={canvas}
	id="canvas"
	class="h-full w-full rounded-box border border-base-300 bg-base-200"
	style="cursor: {state?.cursor};"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onclick={handleClick}
></canvas>
