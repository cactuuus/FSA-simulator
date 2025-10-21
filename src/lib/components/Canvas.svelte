<script lang="ts">
	import { onMount } from 'svelte';
	import type { CanvasState, Point } from '$lib/types';
	import type { FSA } from '$lib/fsa/FSA.svelte';
	import type { StateManager } from '$lib/state-machine/StateManager.svelte';

	let {
		fsa,
		stateManager
	}: {
		fsa: FSA;
		stateManager: StateManager<CanvasState>;
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
		fsa.graph.edges.forEach((edge) => {
			ctx.beginPath();
			ctx.moveTo(edge.from.pos.x, edge.from.pos.y);
			ctx.lineTo(edge.to.pos.x, edge.to.pos.y);
			ctx.stroke();
		});

		// Nodes
		fsa.graph.nodes.forEach((node) => {
			ctx.strokeStyle = 'white';
			ctx.beginPath();
			ctx.arc(node.pos.x, node.pos.y, 30, 0, Math.PI * 2);
			ctx.stroke();

			ctx.fillStyle = 'white';
			ctx.font = '14px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(node.label, node.pos.x, node.pos.y);
		});

		// Selected node
		if (fsa.selectedNode) {
			ctx.strokeStyle = '#3b82f6';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(fsa.selectedNode.pos.x, fsa.selectedNode.pos.y, 32, 0, Math.PI * 2);
			ctx.stroke();
		}

		// Draft edge
		if (fsa.draftEdge) {
			ctx.strokeStyle = '#f97316';
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 5]);

			ctx.beginPath();
			ctx.moveTo(fsa.draftEdge.from.pos.x, fsa.draftEdge.from.pos.y);
			ctx.lineTo(fsa.draftEdge.toPoint.x, fsa.draftEdge.toPoint.y);
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
		stateManager.currentState?.onMouseDown?.(getCanvasPoint(e));
		render();
	}
	function handleMouseMove(e: MouseEvent) {
		stateManager.currentState?.onMouseMove?.(getCanvasPoint(e));
		render();
	}
	function handleMouseUp(e: MouseEvent) {
		stateManager.currentState?.onMouseUp?.(getCanvasPoint(e));
		render();
	}
	function handleClick(e: MouseEvent) {
		stateManager.currentState?.onClick?.(getCanvasPoint(e));
		render();
	}
</script>

<canvas
	bind:this={canvas}
	id="canvas"
	class="h-full w-full rounded-box border border-base-300 bg-base-200"
	style="cursor: {stateManager?.currentState?.cursor};"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onclick={handleClick}
></canvas>
