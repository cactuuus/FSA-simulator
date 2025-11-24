<!--
 Reusable arrowhead for varius types of edges. The id prop is used to uniquely identify each
 instance of this marker, otherwise CSS styles might not apply correctly.
 -->
<script lang="ts">
	const { id }: { id: string } = $props();
</script>

<marker
	{id}
	viewBox="0 0 10 10"
	refX="10"
	refY="5"
	markerWidth="7"
	markerHeight="7"
	orient="auto-start-reverse"
	stroke="none"
	fill="currentColor"
>
	<path d="M 0 0 L 10 5 L 0 10 z" />
</marker>
