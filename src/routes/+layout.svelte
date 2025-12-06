<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="navbar h-16 bg-base-100 shadow-sm">
	<h1 id="banner" class="text-2xl font-extrabold">FSA Simulator</h1>
	<div id="page-actions" class="grow px-4">
		<!-- placeholder for future simulation controls -->
	</div>
</header>

<main class="relative h-[calc(100vh-4rem)] w-full">
	{@render children?.()}
</main>
