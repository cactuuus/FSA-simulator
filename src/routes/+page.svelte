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

	/**
	 * Toolbar tools configuration.
	 */
	const tools = [
		{ mode: 'pan', state: PanningState, kbShortcut: '1', icon: 'fa7-regular--hand' },
		{ mode: 'select', state: SelectState, kbShortcut: '2', icon: 'mdi--cursor-default-outline' },
		{
			mode: 'draw-edge',
			state: DrawEdgeState,
			kbShortcut: '3',
			icon: 'hugeicons--orthogonal-edge'
		},
		{ mode: 'add-node', state: AddNodeState, kbShortcut: '4', icon: 'tabler--circle-plus' }
	];

	function setActive(state: State) {
		editor.stateManager.transitionTo(state);
	}

	function handleKeyDown(e: KeyboardEvent) {
		const tool = tools.find((a) => a.kbShortcut === e.key);
		if (tool) {
			e.preventDefault();
			setActive(new tool.state());
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
		{#each tools as tool (tool.state.name)}
			<li>
				<button
					onclick={() => setActive(new tool.state())}
					aria-label={tool.kbShortcut}
					class="btn relative btn-square btn-ghost btn-secondary {tool.mode ===
					editor.stateManager.currentState?.name
						? 'btn-active'
						: ''}"
				>
					<span class="{tool.icon} h-5 w-5"></span>
					<small class="absolute right-0 -bottom-0.5 align-sub">{tool.kbShortcut}</small>
				</button>
			</li>
		{/each}
	</ul>

	<div class="absolute top-2 right-2">
		<SelectedItemPanel item={editor.selectedItem} />
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
