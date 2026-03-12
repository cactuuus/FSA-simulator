<!-- Efficiently handle a large number of paths by only rendering a (visible) portion of the list at the time, and only fetching full paths for visible ones, the rest is just paths leaves  -->
<script lang="ts">
	import { ComputationTree, type PathLeaf, type FullPath } from './computationTree';
	import { toggleHighlight, toggleAccepted, toggleInvalid } from '$lib/utils/graphEffects';
	import { SvelteSet } from 'svelte/reactivity';

	const ITEM_HEIGHT = 32;
	const BUFFER = 5; // extra items above/below visible window

	const {
		leaves,
		tree,
		onClick
	}: {
		leaves: PathLeaf[];
		tree: ComputationTree;
		onClick: (_path: FullPath) => void;
	} = $props();

	let containerHeight: number = $state(300);
	let scrollTop: number = $state(0);
	const totalHeight: number = $derived(leaves.length * ITEM_HEIGHT);
	const startIndex: number = $derived(Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER));
	const endIndex: number = $derived(
		Math.min(leaves.length, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER)
	);
	const visiblePaths: FullPath[] = $derived(
		leaves.slice(startIndex, endIndex).map((leaf) => tree.getFullPath(leaf))
	);

	function pathToString(path: FullPath): string {
		return path.nodes.map((n) => n.config.state.label).join(' → ');
	}

	function togglePathHighlight(state: boolean, path: FullPath): void {
		const ids = new SvelteSet<string>(['start-edge']);
		const pathLength = path.nodes.length;
		path.nodes.forEach((node, index) => {
			if (node.parent) ids.add(node.parent.via.id);
			const id = node.config.state.id;
			if (index === pathLength - 1) {
				if (path.isAccepting) {
					toggleAccepted(state, id);
				} else {
					toggleInvalid(state, id);
				}
			}
			ids.add(id);
		});
		toggleHighlight(state, ...ids);
	}

	function handleClick(path: FullPath): void {
		togglePathHighlight(false, path);
		onClick(path);
	}
</script>

<div
	bind:clientHeight={containerHeight}
	onscroll={(e) => (scrollTop = (e.target as HTMLDivElement).scrollTop)}
	class="relative max-h-64 overflow-y-auto"
>
	<div style:height="{totalHeight}px">
		<ol class="absolute w-full" style:top="{startIndex * ITEM_HEIGHT}px">
			{#each visiblePaths as path, i (startIndex + i)}
				{@const label = pathToString(path)}
				<li style:height="{ITEM_HEIGHT}px">
					<button
						class="w-full truncate px-2 text-left font-semibold hover:text-secondary"
						style:height="{ITEM_HEIGHT}px"
						style:line-height="{ITEM_HEIGHT}px"
						title={label}
						onmouseenter={() => togglePathHighlight(true, path)}
						onmouseleave={() => togglePathHighlight(false, path)}
						onclick={() => handleClick(path)}
					>
						{startIndex + i + 1}. {label}
					</button>
				</li>
			{/each}
		</ol>
	</div>
</div>
