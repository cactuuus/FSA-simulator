<script lang="ts">
	import { Node, Edge, type FSAItem } from '$lib/automata-models';
	import { type EditorContext } from '../EditorContext';
	import { Trash2 } from '@lucide/svelte';
	import NodeDetails from './NodeDetails.svelte';
	import EdgeDetails from './EdgeDetails.svelte';
	import { DeleteFSAItemsCommand } from '../commands';
	import { type Point } from '$lib/utils/geometry';
	import { scale } from 'svelte/transition';
	import { getEdgeLabelPosition } from '$lib/utils/edgeUtils';

	const { editor }: { editor: EditorContext } = $props();

	const OFFSET = { x: 30, y: 30 };
	let panelElement: HTMLElement | null = $state(null);
	const items: FSAItem[] = $derived(editor.selection.items);
	const anchorSvg = $derived.by((): Point | null => {
		if (items.length === 0) return null;

		// single item selected
		if (items.length === 1) {
			const item = items[0];
			if (item instanceof Node) return item.pos;
			if (item instanceof Edge) return getEdgeLabelPosition(item);
			return null;
		}

		// at least one node in selection
		const nodes = items.filter((i): i is Node => i instanceof Node);
		if (nodes.length > 0) {
			return nodes.reduce((prev, curr) =>
				curr.pos.x + curr.pos.y > prev.pos.x + prev.pos.y ? curr : prev
			).pos;
		}

		// selection is made of edges only
		const edges = items.filter((i): i is Edge => i instanceof Edge);
		return edges
			.map(getEdgeLabelPosition)
			.reduce((prev, curr) => (curr.x + curr.y > prev.x + prev.y ? curr : prev));
	});

	// Drag state
	let isDragging = $state(false);
	let dragOffset = $state<Point | null>(null);
	let dragStartMouse: Point = { x: 0, y: 0 };
	let dragStartPos: Point = { x: 0, y: 0 };

	const baseScreenPos = $derived.by(() => {
		if (!anchorSvg) return null;
		const raw = editor.viewport.svgToScreen(anchorSvg);
		return { x: raw.x + OFFSET.x, y: raw.y + OFFSET.y };
	});
	const screenPos = $derived.by(() => {
		if (!baseScreenPos) return null;
		return dragOffset ?? baseScreenPos;
	});

	function onDragStart(e: PointerEvent) {
		if (!screenPos) return;
		e.preventDefault();
		isDragging = true;
		dragStartMouse = { x: e.clientX, y: e.clientY };
		dragStartPos = { ...screenPos };
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		window.addEventListener('pointermove', onDragMove);
		window.addEventListener('pointerup', onDragEnd);
	}

	function onDragMove(e: PointerEvent) {
		if (!isDragging) return;
		dragOffset = {
			x: dragStartPos.x + (e.clientX - dragStartMouse.x),
			y: dragStartPos.y + (e.clientY - dragStartMouse.y)
		};
	}

	function onDragEnd(e: PointerEvent) {
		isDragging = false;
		(e.target as HTMLElement).releasePointerCapture(e.pointerId);
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointerup', onDragEnd);
	}

	function deleteSelected() {
		const toDelete = items.map((item) => item.id);
		if (toDelete.length === 0) return;
		editor.commandHistory.pushAndExecute(new DeleteFSAItemsCommand(...toDelete));
	}

	// Focus panel when it appears
	$effect(() => {
		if (screenPos && panelElement) {
			panelElement.focus({ preventScroll: true });
		}
	});

	// Reset drag when selection changes
	$effect(() => {
		void items; // way to depend on anchorSvg without actually using it
		dragOffset = null;
	});
</script>

{#if items.length > 0 && screenPos}
	<div
		bind:this={panelElement}
		tabindex="-1"
		class="border-content max-w-90% absolute flex w-64 flex-col gap-2 rounded-r-box rounded-b-box border bg-base-100/80 text-sm shadow backdrop-blur-xs"
		transition:scale={{ duration: 200, start: 0.9 }}
		style:left="{screenPos.x}px"
		style:top="{screenPos.y}px"
	>
		<!-- Header (drag handle) -->
		<div
			role="toolbar"
			class="border-content flex items-center justify-between gap-2 border-b p-2 hover:bg-base-content/5"
			style:cursor={isDragging ? 'grabbing' : 'grab'}
			onpointerdown={onDragStart}
		>
			{#if items.length === 1}
				{@const item = items[0]}
				<h2 class="font-bold">{item instanceof Node ? 'State' : 'Edge'}</h2>
				<button
					class="btn btn-xs btn-error"
					onpointerdown={(e) => e.stopPropagation()}
					onclick={deleteSelected}
				>
					<Trash2 class="h-3 w-3" />
					Delete
				</button>
			{:else}
				<h2 class="font-bold">Selection</h2>
			{/if}
		</div>

		<!-- Content -->
		<div class="p-2 pt-0">
			{#if items.length === 1}
				{@const item = items[0]}
				{#if item instanceof Node}
					<NodeDetails
						node={item}
						fsaGraph={editor.fsaGraph}
						commandHistory={editor.commandHistory}
					/>
				{:else if item instanceof Edge}
					<EdgeDetails
						edge={item}
						fsaGraph={editor.fsaGraph}
						commandHistory={editor.commandHistory}
					/>
				{/if}
			{:else}
				<button class="btn w-full btn-sm btn-error" onclick={deleteSelected}>
					<Trash2 class="h-3 w-3" /> Delete {items.length} items
				</button>
			{/if}
		</div>
	</div>
{/if}
