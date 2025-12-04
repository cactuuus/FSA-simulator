<script lang="ts">
	import { onMount } from 'svelte';
	import {
		AddNodeState,
		SelectState,
		DrawEdgeState,
		PanningState,
		type State
	} from '$lib/state-machine';
	import DrawingBoard from '$lib/UI/canvas/DrawingBoard.svelte';
	import { editor } from '$lib/stores/editor.svelte';
	import SelectedItemPanel from '$lib/UI/SelectedItemPanel.svelte';
	import { CirclePlus, Spline, Hand, MousePointer, type Icon as IconType } from '@lucide/svelte';

	interface Tool {
		state: string;
		kbShortcut: string;
		icon: typeof IconType;
	}

	/**
	 * Toolbar tools configuration.
	 */
	const tools: Tool[] = [
		{ state: PanningState.NAME, kbShortcut: '1', icon: Hand },
		{ state: SelectState.NAME, kbShortcut: '2', icon: MousePointer },
		{ state: DrawEdgeState.NAME, kbShortcut: '3', icon: Spline },
		{ state: AddNodeState.NAME, kbShortcut: '4', icon: CirclePlus }
	];

	function setActive(state: string) {
		editor.stateManager.transitionTo(state);
	}

	function handleKeyDown(e: KeyboardEvent) {
		// prevent interfering with input fields
		const target = e.target as HTMLElement;
		const isTyping =
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'SELECT' ||
			target.isContentEditable;
		if (isTyping) {
			return;
		}

		const tool = tools.find((a) => a.kbShortcut === e.key);
		if (tool) {
			e.preventDefault();
			setActive(tool.state);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			editor.clearSelection();
		} else if (e.key === 'Delete') {
			e.preventDefault();
			editor.deleteSelectedItem();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<section class="relative h-full w-full">
	<DrawingBoard />

	<ul
		class="absolute top-2 left-1/2 mx-2 flex -translate-x-1/2 flex-row gap-2 rounded-box bg-base-100 px-2 py-1 shadow"
	>
		{#each tools as tool (tool.state)}
			{@const Icon = tool.icon}
			<li>
				<button
					onclick={() => setActive(tool.state)}
					aria-label={tool.kbShortcut}
					class="btn relative btn-square btn-ghost btn-secondary {tool.state ===
					editor.stateManager.currentState?.name
						? 'btn-active'
						: ''}"
				>
					<Icon class="h-5 w-5" />
					<small class="absolute right-0 -bottom-0.5 align-sub">{tool.kbShortcut}</small>
				</button>
			</li>
		{/each}
	</ul>

	<div class="absolute top-2 right-2">
		<SelectedItemPanel item={editor.selectedItem} fsa={editor.fsaGraph} />
	</div>

	<div class="absolute bottom-2 left-2 rounded-box bg-base-100 px-3 py-2 text-sm shadow">
		Mode: {editor.stateManager.currentState?.name}
		| Nodes: {editor.fsaGraph.nodes.length}
		| Edges: {editor.fsaGraph.edges.length}
	</div>
	<div
		class="absolute right-2 bottom-2 flex items-center gap-0.5 rounded-box bg-base-100 px-3 py-2 text-sm shadow"
	>
		<span class="mx-1">{editor.prettyZoomLevel}</span>

		<button
			class="btn btn-square text-xl btn-ghost btn-xs"
			onclick={() => editor.adjustZoom(0.1)}
			aria-label="Zoom In"
		>
			+
		</button>
		<button
			class="btn btn-square text-xl btn-ghost btn-xs"
			onclick={() => editor.adjustZoom(-0.1)}
			aria-label="Zoom Out"
		>
			-
		</button>
	</div>
</section>
