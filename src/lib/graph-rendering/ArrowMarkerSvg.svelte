<!--
 Reusable arrowhead for varius types of edges. The id prop is used to uniquely identify each
 instance of this marker, otherwise CSS styles might not apply correctly.

 NOTE: refX is adjusted to push the arrowhead a tiny bit further, as otherwise it overlaps with the
 end of the edge line, losing its 'pointiness'.
 -->
<script lang="ts">
	const { id, size, classes }: { id: string; size: number; classes?: string } = $props();
</script>

<marker
	{id}
	class={classes}
	viewBox={`0 0 ${size} ${size}`}
	refX={size - 1}
	refY={size / 2}
	markerWidth={size}
	markerHeight={size}
	orient="auto-start-reverse"
	stroke="none"
	fill="currentColor"
>
	<path d={`M 0 0 L ${size} ${size / 2} L 0 ${size} z`} />
</marker>
