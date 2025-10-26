<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { DrawingBoard } from '$lib/canvas';
	import { FSA } from '$lib/fsa';
	import {
		type CanvasState,
		StateManager,
		SelectState,
		DrawEdgeState,
		AddNodeState
	} from '$lib/state-machine';

	let fsa = $state(new FSA());
	const tools = [
		{ state: new SelectState(fsa), kbShortcut: '1', icon: 'mdi--cursor-default-outline' },
		{ state: new DrawEdgeState(fsa), kbShortcut: '2', icon: 'hugeicons--orthogonal-edge' },
		{ state: new AddNodeState(fsa), kbShortcut: '3', icon: 'tabler--circle-plus' }
	];

	let stateManager = $state(new StateManager(tools.map((tool) => tool.state)));

	setContext('stateManager', () => stateManager);

	function setActive(selectedState: CanvasState) {
		stateManager.transition(selectedState.name);
	}

	function handleKeyDown(e: KeyboardEvent) {
		const action = tools.find((a) => a.kbShortcut === e.key);
		if (action) {
			e.preventDefault();
			setActive(action.state);
		}
	}

	onMount(() => {
		stateManager.transition('select');
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<section class="relative h-full w-full">
	<DrawingBoard {fsa} state={stateManager?.currentState} />

	<ul
		class="absolute top-2 left-1/2 mx-2 flex -translate-x-1/2 flex-row gap-2 rounded-box bg-base-100 px-2 py-1 shadow"
	>
		{#each tools as tool (tool.state.name)}
			<li>
				<button
					onclick={() => setActive(tool.state)}
					aria-label={tool.kbShortcut}
					class="btn relative btn-square btn-ghost btn-secondary {tool.state.name ===
					stateManager?.currentState?.name
						? 'btn-active'
						: ''}"
				>
					<span class="{tool.icon} h-5 w-5"></span>
					<small class="absolute right-0 -bottom-0.5 align-sub">{tool.kbShortcut}</small>
				</button>
			</li>
		{/each}
	</ul>

	<div class="absolute bottom-2 left-2 rounded-box bg-base-100 px-3 py-2 text-xs shadow">
		Mode: {stateManager?.currentState?.name} | Nodes: {fsa.nodes.length} | Edges: {fsa.edges.length}
	</div>
</section>
