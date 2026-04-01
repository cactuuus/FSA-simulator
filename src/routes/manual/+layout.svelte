<script lang="ts">
	import '../../manual.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>FSA Toolkit — Manual</title>
</svelte:head>

{@render children()}
