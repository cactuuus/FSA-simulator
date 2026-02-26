<script module lang="ts">
	import { type Icon as IconType } from '@lucide/svelte';

	export interface Tool {
		stateName: string;
		kbShortcut: string;
		icon: typeof IconType;
		title: string;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { isTyping } from '$lib/utils/keyboard';
	import type { StateMachine, State } from '$lib/interaction';

	const { tools, stateMachine }: { tools: Tool[]; stateMachine: StateMachine<State> } = $props();

	function handleKeyDown(e: KeyboardEvent) {
		if (isTyping(e)) return;
		const tool = tools.find((a) => a.kbShortcut === e.key);
		if (tool) {
			e.preventDefault();
			stateMachine.transitionTo(tool.stateName);
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<ul class="mx-2 flex flex-row gap-2 rounded-box bg-base-100/95 px-2 py-1 shadow">
	{#each tools as tool (tool.stateName)}
		{@const Icon = tool.icon}
		<li>
			<button
				onclick={() => stateMachine.transitionTo(tool.stateName)}
				aria-label={tool.kbShortcut}
				title={tool.title}
				class="btn relative btn-square text-base-content btn-ghost btn-sm btn-secondary
							{tool.stateName === stateMachine.currentState.name ? 'btn-active' : ''}"
			>
				<Icon class="h-4 w-4" />
				<small class="absolute right-0 -bottom-0.5 align-sub">{tool.kbShortcut}</small>
			</button>
		</li>
	{/each}
</ul>
