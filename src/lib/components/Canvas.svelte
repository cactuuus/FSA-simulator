<script lang="ts">
	import { onMount } from 'svelte';
	import type { FSA, Point } from '$lib/fsa';
	import type { CanvasState } from '$lib/state-machine';

	let {
		fsa,
		state
	}: {
		fsa: FSA;
		state: CanvasState | null;
	} = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	// TODO -- update colors to reflect dark/light themes
	function render() {
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Edges
		ctx.strokeStyle = '#64748b';
		ctx.lineWidth = 2;
		fsa.edges.forEach((edge) => {
			ctx.beginPath();
			ctx.moveTo(edge.from.pos.x, edge.from.pos.y);
			ctx.lineTo(edge.to.pos.x, edge.to.pos.y);
			ctx.stroke();
		});

		// Nodes
		fsa.nodes.forEach((node) => {
			ctx.strokeStyle = 'white';
			ctx.beginPath();
			ctx.arc(node.pos.x, node.pos.y, 30, 0, Math.PI * 2);
			ctx.stroke();

			ctx.fillStyle = 'white';
			ctx.font = '14px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(node.label, node.pos.x, node.pos.y);

			if (node.isSelected) {
				ctx.strokeStyle = '#3b82f6';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(node.pos.x, node.pos.y, 32, 0, Math.PI * 2);
				ctx.stroke();
				ctx.lineWidth = 2;
			}
		});

		// Draft edge
		if (fsa.draftEdge) {
			ctx.strokeStyle = '#f97316';
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 5]);

			ctx.beginPath();
			ctx.moveTo(fsa.draftEdge.sourcePoint.x, fsa.draftEdge.sourcePoint.y);
			ctx.lineTo(fsa.draftEdge.targetPoint.x, fsa.draftEdge.targetPoint.y);
			ctx.stroke();

			ctx.setLineDash([]);
		}
	}

	onMount(() => {
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		ctx = canvas.getContext('2d')!;
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
