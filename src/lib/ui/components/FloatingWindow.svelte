<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { X } from '@lucide/svelte';
	import type { Point } from '$lib/utils/geometry';

	/**
	 * Simple interface representing size dimensions. Similar to Point, but for width and height.
	 */
	interface Size {
		width: number;
		height: number;
	}

	let { header, content }: { header: Snippet; content: Snippet } = $props();
	const PADDING: number = 4;
	const DEFAULT_POS: Point = { x: 50, y: 50 };
	const MIN_SIZE: Size = { width: 200, height: 100 };

	// Position of the window
	let position: Point = $state({ ...DEFAULT_POS });
	let isMoving: boolean = $state(false);
	let moveStartPos: Point = $state({ x: 0, y: 0 });
	let moveStartMouse: Point = $state({ x: 0, y: 0 });

	// Size of the window
	let defaultSize: Size = $state({ width: 0, height: 0 }); // inferred from the browser
	let sizeOverride: Size | null = $state(null);
	let isResizing: boolean = $state(false);
	let resizeStartSize: Size = $state({ width: 0, height: 0 });
	let resizeStartMouse: Point = $state({ x: 0, y: 0 });

	// HTML reference elements
	let windowElement: HTMLElement | null = null;
	let headerElement: HTMLElement | null = null;
	let parentElement: HTMLElement | null = null;
	let parentBounds: Size = $state({ width: 0, height: 0 });

	// Position adjusted considering the bounds of the window. It stops the window from being 'lost/hidden' outside the parent.
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

	// Size adjusted considering the bounds of the window. It stops the window from overflowing outside the parent.
	const clampedSize: Size = $derived.by(() => {
		const size = sizeOverride ?? defaultSize;
		return {
			width: Math.min(size.width, defaultSize.width),
			height: Math.min(size.height, defaultSize.height)
		};
	});

	function handleMouseDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		isMoving = true;
		moveStartPos = { ...position };
		moveStartMouse = { x: e.clientX, y: e.clientY };
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
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
		if (e.target instanceof HTMLElement) e.target.releasePointerCapture(e.pointerId);
		window.removeEventListener('pointermove', handleMouseMove);
		window.removeEventListener('pointerup', handleMouseUp);
	}

	function handleResizeMouseDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		isResizing = true;
		resizeStartSize = { ...clampedSize };
		resizeStartMouse = { x: e.clientX, y: e.clientY };
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		window.addEventListener('pointermove', handleResizeMove);
		window.addEventListener('pointerup', handleResizeUp);
	}

	function handleResizeMove(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (isResizing) {
			sizeOverride = {
				width: Math.max(MIN_SIZE.width, resizeStartSize.width + (e.clientX - resizeStartMouse.x)),
				height: Math.max(MIN_SIZE.height, resizeStartSize.height + (e.clientY - resizeStartMouse.y))
			};
		}
	}

	function handleResizeUp(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		isResizing = false;
		if (e.target instanceof HTMLElement) e.target.releasePointerCapture(e.pointerId);
		window.removeEventListener('pointermove', handleResizeMove);
		window.removeEventListener('pointerup', handleResizeUp);
	}

	onMount(() => {
		if (!windowElement || !windowElement.parentElement) {
			throw new Error('Floating window element or parent element not found.');
		}
		parentElement = windowElement.parentElement;

		// Observe parent size changes to adjust bounds.
		const parentObserver = new ResizeObserver(() => {
			const rect = parentElement!.getBoundingClientRect();
			parentBounds = { width: rect.width, height: rect.height };
		});

		// Observe window size changes to adjust size state. Used to infer the 'automatic' size of the window, as assigned by the browser.
		const windowObserver = new ResizeObserver(() => {
			if (isResizing || sizeOverride) return;
			defaultSize = {
				width: windowElement!.offsetWidth,
				height: windowElement!.offsetHeight
			};
		});

		parentObserver.observe(parentElement);
		windowObserver.observe(windowElement);

		return () => {
			parentObserver.disconnect();
			windowObserver.disconnect();
		};
	});
</script>

<div
	bind:this={windowElement}
	class="floating-window absolute flex max-h-10/12 max-w-10/12 touch-none flex-col rounded-t-box rounded-bl-box border border-base-content/30 bg-base-100/95 text-sm shadow"
	style:top="{clampedPosition.y}px"
	style:left="{clampedPosition.x}px"
	style:width={sizeOverride ? `${clampedSize.width}px` : 'auto'}
	style:height={sizeOverride ? `${clampedSize.height}px` : 'auto'}
>
	<div
		bind:this={headerElement}
		role="toolbar"
		tabindex="-1"
		class="flex shrink-0 cursor-move items-center justify-between border-b border-base-content/30 px-4 py-2 font-bold hover:bg-base-content/5"
		style:cursor={isMoving ? 'grabbing' : 'grab'}
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
	<!-- Resize handle, it is simply styled to appear as a triangle on the bottom-right corner -->
	<button
		class="resize-handle absolute right-0 bottom-0 h-4 w-4 cursor-nwse-resize bg-[linear-gradient(135deg,transparent_50%,currentColor_50%)] opacity-30 hover:opacity-60"
		title="Drag to resize window"
		onpointerdown={handleResizeMouseDown}
	></button>
</div>
