<script lang="ts">
	import type { Point } from '$lib/utils/geometry';
	const { start, end }: { start: Point; end: Point } = $props();

	// NOTE: the SVG rect element cannot have negative width or height, therefore we need to
	// manually adjust the rectable to only use positive values
	const width = $derived(end.x - start.x);
	const height = $derived(end.y - start.y);
	const flipWidth = $derived(width < 0);
	const flipHeight = $derived(height < 0);
</script>

<rect
	class="selection-area"
	x={flipWidth ? start.x + width : start.x}
	y={flipHeight ? start.y + height : start.y}
	width={flipWidth ? -width : width}
	height={flipHeight ? -height : height}
/>
