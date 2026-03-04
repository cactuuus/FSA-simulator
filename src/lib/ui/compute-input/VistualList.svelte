<!-- Helper component to efficiently handle long lists, by only rendering a (visible) portion of the
 list at the time  -->
<script lang="ts" generics="T">
	const ITEM_HEIGHT = 32;
	const BUFFER = 5; // extra items above/below visible window

	let {
		items,
		onmouseenter,
		onmouseleave,
		getLabel,
		onclick
	}: {
		items: T[];
		getLabel: (item: T) => string;
		onclick: (item: T) => void;
		onmouseenter: (item: T) => void;
		onmouseleave: (item: T) => void;
	} = $props();

	let containerHeight = $state(300);
	let scrollTop = $state(0);
	const totalHeight = $derived(items.length * ITEM_HEIGHT);

	const startIndex = $derived(Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER));
	const endIndex = $derived(
		Math.min(items.length, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER)
	);

	const visibleItems = $derived(items.slice(startIndex, endIndex));
	const offsetTop = $derived(startIndex * ITEM_HEIGHT);
</script>

<div
	bind:clientHeight={containerHeight}
	onscroll={(e) => (scrollTop = (e.target as HTMLDivElement).scrollTop)}
	class="relative max-h-64 overflow-y-auto"
>
	<div style:height="{totalHeight}px">
		<!-- Visible items absolutely positioned at correct offset -->
		<ol class="absolute w-full" style:top="{offsetTop}px">
			{#each visibleItems as item, i (startIndex + i)}
				{@const label = getLabel(item)}
				<li
					class="truncate px-2 font-semibold hover:cursor-pointer hover:text-secondary"
					style:height="{ITEM_HEIGHT}px"
					style:line-height="{ITEM_HEIGHT}px"
					title={label}
					onmouseenter={() => onmouseenter(item)}
					onmouseleave={() => onmouseleave(item)}
					onclick={() => onclick(item)}
				>
					{startIndex + i + 1}. {label}
				</li>
			{/each}
		</ol>
	</div>
</div>
