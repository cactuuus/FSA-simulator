<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Actions } from '$lib/ui';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="navbar flex min-h-12! items-end gap-6 bg-base-100">
	<h1 id="banner" class="text-xl font-extrabold">FSA Simulator</h1>
	<div id="page-actions" class="flex grow items-end px-4">
		<Actions />
	</div>
</header>

<main class="relative h-[calc(100vh-3rem)] w-full">
	{@render children?.()}
</main>
