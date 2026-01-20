<!--
 Reusable arrowhead for varius types of edges. The id prop is used to uniquely identify each
 instance of this marker, otherwise CSS styles might not apply correctly.
 -->
<script lang="ts">
	const { id }: { id: string } = $props();
	const size = 4;
</script>

<marker
	{id}
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
