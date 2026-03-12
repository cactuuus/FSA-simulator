<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { X, Minus, Fullscreen } from '@lucide/svelte';
	import type { Point, Size } from '$lib/utils/geometry';
	import type { Window } from './Windows.svelte';

	let {
		id,
		header,
		content,
		initialPosition,
		windowState,
		onClose,
		canBeResized = true,
		defaultWidth = 500
	}: {
		id?: string;
		header: Snippet;
		content: Snippet;
		windowState: Window;
		initialPosition?: Point;
		onClose?: () => void;
		canBeResized?: boolean;
		defaultWidth?: number;
	} = $props();

	const PADDING = 8;
	const MIN_SIZE: Size = { width: 200, height: 100 };

	// Position of the window
	let isMoving: boolean = $state(false);
	let moveStartPos: Point = $state({ x: 0, y: 0 });
	let moveStartMouse: Point = $state({ x: 0, y: 0 });

	// Size of the window
	let isResizing: boolean = $state(false);
	let resizeStartSize: Size = $state({ width: 0, height: 0 });
	let resizeStartMouse: Point = $state({ x: 0, y: 0 });

	// HTML reference elements
	let windowElement: HTMLElement | null = null;
	let headerElement: HTMLElement | null = null;
	let parentBounds: Size = $state({ width: 0, height: 0 });

	const resolvedWidth = $derived(
		Math.min(
			Math.max(windowState.sizeOverride?.width ?? defaultWidth, MIN_SIZE.width),
			parentBounds.width > 0 ? parentBounds.width - 2 * PADDING : Infinity
		)
	);

	const resolvedHeight = $derived(
		windowState.sizeOverride?.height
			? Math.max(windowState.sizeOverride.height, MIN_SIZE.height)
			: null // null = CSS 'auto'
	);

	const clampedPosition: Point = $derived.by(() => {
		const pos = windowState.positionOverride ?? { x: PADDING, y: PADDING };
		return {
			x: Math.min(
				Math.max(pos.x, PADDING),
				parentBounds.width - (headerElement?.offsetWidth ?? resolvedWidth) - PADDING
			),
			y: Math.min(
				Math.max(pos.y, PADDING),
				parentBounds.height - (headerElement?.offsetHeight ?? MIN_SIZE.height) - PADDING
			)
		};
	});

	function handleMouseDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		isMoving = true;
		moveStartPos = { ...clampedPosition };
		moveStartMouse = { x: e.clientX, y: e.clientY };
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		window.addEventListener('pointermove', handleMouseMove);
		window.addEventListener('pointerup', handleMouseUp);
	}

	function handleMouseMove(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (isMoving) {
			windowState.positionOverride = {
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
		resizeStartSize = {
			width: resolvedWidth,
			height: resolvedHeight ?? windowElement?.offsetHeight ?? MIN_SIZE.height
		};
		resizeStartMouse = { x: e.clientX, y: e.clientY };
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		window.addEventListener('pointermove', handleResizeMove);
		window.addEventListener('pointerup', handleResizeUp);
	}

	function handleResizeMove(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (isResizing) {
			windowState.sizeOverride = {
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
		if (!windowElement?.parentElement) {
			throw new Error('Floating window element or parent element not found.');
		}
		const parentElement = windowElement.parentElement;

		// Read parent bounds synchronously so resolvedWidth is correct before we measure the window
		const rect = parentElement.getBoundingClientRect();
		parentBounds = { width: rect.width, height: rect.height };

		// Set initial position once based on actual rendered size.
		// After this, positionOverride is the single source of truth and
		// the user can move the window freely.
		if (!windowState.positionOverride) {
			const w = windowElement.offsetWidth;
			const h = windowElement.offsetHeight;
			windowState.positionOverride = initialPosition ?? {
				x: Math.max((parentBounds.width - w) / 2, PADDING),
				y: Math.max((parentBounds.height - h) / 2, PADDING)
			};
		}

		const parentObserver = new ResizeObserver(() => {
			const r = parentElement.getBoundingClientRect();
			parentBounds = { width: r.width, height: r.height };
		});
		parentObserver.observe(parentElement);
		return () => parentObserver.disconnect();
	});
</script>

<div
	bind:this={windowElement}
	class="floating-window absolute flex max-h-full max-w-full touch-none flex-col overflow-hidden rounded-t-box rounded-bl-box border border-base-content/30 bg-base-100/90 text-sm shadow backdrop-blur-xs"
	class:rounded-br-box={windowState.isMinimized || !canBeResized}
	style:top="{clampedPosition.y}px"
	style:left="{clampedPosition.x}px"
	style:width="{resolvedWidth}px"
	style:height={resolvedHeight !== null && !windowState.isMinimized
		? `${resolvedHeight}px`
		: 'auto'}
	style:max-height="{parentBounds.height - 2 * PADDING}px"
	style:max-width="{parentBounds.width - 2 * PADDING}px"
>
	<div
		bind:this={headerElement}
		{id}
		role="toolbar"
		tabindex="-1"
		class="flex shrink-0 cursor-move items-center justify-between gap-4 border-b border-base-content/30 p-2 font-bold hover:bg-base-content/5"
		style:cursor={isMoving ? 'grabbing' : 'grab'}
		onpointerdown={handleMouseDown}
	>
		{@render header()}
		<div class="window-actions flex">
			<button
				onclick={() => (windowState.isMinimized = !windowState.isMinimized)}
				class="btn btn-square btn-ghost btn-xs"
			>
				{#if windowState.isMinimized}
					<Fullscreen class="h-4 w-4" />
				{:else}
					<Minus class="h-4 w-4" />
				{/if}
			</button>
			{#if onClose}
				<button onclick={onClose} class="btn btn-square btn-ghost btn-xs btn-error">
					<X class="h-4 w-4" />
				</button>
			{/if}
		</div>
	</div>
	{#if !windowState.isMinimized}
		<div class="w-full flex-1 overflow-auto p-2">
			{@render content()}
		</div>
		<!-- Resize handle, it is simply styled to appear as a triangle on the bottom-right corner -->
		{#if canBeResized}
			<button
				class="resize-handle absolute right-0 bottom-0 h-4 w-4 cursor-nwse-resize bg-[linear-gradient(135deg,transparent_50%,currentColor_50%)] opacity-30 hover:opacity-60"
				title="Drag to resize, double-click to reset"
				onpointerdown={handleResizeMouseDown}
				ondblclick={() => (windowState.sizeOverride = null)}
			></button>
		{/if}
	{/if}
</div>
