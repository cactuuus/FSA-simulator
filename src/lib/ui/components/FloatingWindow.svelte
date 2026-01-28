<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { X } from '@lucide/svelte';
	import type { Point } from '$lib/utils/geometry';

	interface Size {
		width: number;
		height: number;
	}

	let { header, content }: { header: Snippet; content: Snippet } = $props();
	const PADDING: number = 4;
	const DEFAULT_POS: Point = { x: 100, y: 100 };
	const DEFAULT_SIZE: Size = { width: 400, height: 300 };
	const MIN_SIZE: Size = { width: 200, height: 100 };

	let position: Point = $state({ ...DEFAULT_POS });
	let isMoving: boolean = $state(false);
	let moveStartPos: Point = $state({ x: 0, y: 0 });
	let moveStartMouse: Point = $state({ x: 0, y: 0 });

	let size: Size = $state({ ...DEFAULT_SIZE });
	let isResizing: boolean = $state(false);
	let resizeStartSize: Size = $state({ width: 0, height: 0 });
	let resizeStartMouse: Point = $state({ x: 0, y: 0 });

	let windowElement: HTMLElement | null = null;
	let headerElement: HTMLElement | null = null;
	let parentElement: HTMLElement | null = null;
	let parentBounds: Size = $state({ width: 0, height: 0 });

	const clampedPosition = $derived.by(() => {
		return {
			x: Math.min(
				Math.max(position.x, PADDING),
				parentBounds.width - (headerElement?.offsetWidth ?? 0) - PADDING
			),
			y: Math.min(
				Math.max(position.y, PADDING),
				parentBounds.height - (headerElement?.offsetHeight ?? 0) - PADDING
			)
		};
	});

	function handleMouseDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		isMoving = true;
		moveStartPos = { ...position };
		moveStartMouse = { x: e.clientX, y: e.clientY };
		window.addEventListener('pointermove', handleMouseMove);
		window.addEventListener('pointerup', handleMouseUp);
	}

	function handleMouseMove(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (isMoving) {
			position = {
				x: moveStartPos.x + (e.clientX - moveStartMouse.x),
				y: moveStartPos.y + (e.clientY - moveStartMouse.y)
			};
		}
	}

	function handleMouseUp(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		isMoving = false;
		window.removeEventListener('pointermove', handleMouseMove);
		window.removeEventListener('pointerup', handleMouseUp);
	}

	function handleResizeMouseDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		isResizing = true;
		resizeStartSize = { ...size };
		resizeStartMouse = { x: e.clientX, y: e.clientY };
		window.addEventListener('pointermove', handleResizeMove);
		window.addEventListener('pointerup', handleResizeUp);
	}

	function handleResizeMove(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (isResizing) {
			size = {
				width: Math.max(MIN_SIZE.width, resizeStartSize.width + (e.clientX - resizeStartMouse.x)),
				height: Math.max(MIN_SIZE.height, resizeStartSize.height + (e.clientY - resizeStartMouse.y))
			};
		}
	}

	function handleResizeUp(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		isResizing = false;
		window.removeEventListener('pointermove', handleResizeMove);
		window.removeEventListener('pointerup', handleResizeUp);
	}

	onMount(() => {
		if (!windowElement || !windowElement.parentElement) {
			throw new Error('Floating window element or parent element not found.');
		}

		parentElement = windowElement.parentElement;
		const resizeObserver = new ResizeObserver(() => {
			const rect = parentElement!.getBoundingClientRect();
			parentBounds = { width: rect.width, height: rect.height };
		});
		resizeObserver.observe(parentElement);
		return () => resizeObserver.disconnect();
	});
</script>

<div
	bind:this={windowElement}
	class="floating-window absolute flex flex-col rounded-t-box rounded-bl-box border border-base-content/30 bg-base-100/95 text-sm shadow"
	style="
        top: {clampedPosition.y}px; left: {clampedPosition.x}px;
        width: {size.width}px; height: {size.height}px;
    "
>
	<div
		bind:this={headerElement}
		role="toolbar"
		tabindex="-1"
		class="flex shrink-0 cursor-move items-center justify-between border-b border-base-content/30 px-4 py-2 font-bold hover:bg-base-content/5"
		style="cursor: {isMoving ? 'grabbing' : 'grab'}"
		onpointerdown={handleMouseDown}
	>
		{@render header()}
		<button
			onclick={() => console.log('close clicked')}
			class="btn btn-square btn-ghost btn-xs btn-error"
		>
			<X class="h-4 w-4" />
		</button>
	</div>
	<div class="flex-1 overflow-auto p-2">
		{@render content()}
	</div>
	<button
		class="resize-handle absolute right-0 bottom-0 h-4 w-4 cursor-nwse-resize bg-[linear-gradient(135deg,transparent_50%,currentColor_50%)] opacity-30 hover:opacity-60"
		title="Drag to resize window"
		onpointerdown={handleResizeMouseDown}
	></button>
</div>
