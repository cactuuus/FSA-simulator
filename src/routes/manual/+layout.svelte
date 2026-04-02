<script lang="ts">
	import '../../manual.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Manual — FSA Toolkit</title>
</svelte:head>

{@render children()}
