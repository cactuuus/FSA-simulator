<script lang="ts">
	import { onMount } from 'svelte';
	import {
		AddNodeState,
		SelectState,
		DrawEdgeState,
		PanningState
	} from '$lib/application/interaction';
	import { app } from '$lib/stores/app.svelte';
	import { DrawingBoard, SelectedItemPanel } from '$lib/ui';
	import {
		CirclePlus,
		Spline,
		Hand,
		MousePointer,
		Plus,
		Minus,
		type Icon as IconType
	} from '@lucide/svelte';

	interface Tool {
		state: string;
		kbShortcut: string;
		icon: typeof IconType;
	}

	/**
	 * Toolbar tools configuration.
	 */
	const tools: Tool[] = [
		{ state: PanningState.NAME, kbShortcut: '1', icon: Hand },
		{ state: SelectState.NAME, kbShortcut: '2', icon: MousePointer },
		{ state: DrawEdgeState.NAME, kbShortcut: '3', icon: Spline },
		{ state: AddNodeState.NAME, kbShortcut: '4', icon: CirclePlus }
	];

	function setActive(state: string) {
		app.editor.transitionTo(state);
	}

	function handleKeyDown(e: KeyboardEvent) {
		// prevent interfering with input fields
		const target = e.target as HTMLElement;
		const isTyping =
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'SELECT' ||
			target.isContentEditable;
		if (isTyping) {
			return;
		}

		const tool = tools.find((a) => a.kbShortcut === e.key);
		if (tool) {
			e.preventDefault();
			setActive(tool.state);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			app.editor.selectionManager.clearSelection();
		} else if (e.key === 'Delete') {
			e.preventDefault();
			app.editor.selectionManager.deleteSelectedItems();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<section class="relative h-full w-full">
	<DrawingBoard editor={app.editor} />

	<ul
		class="absolute top-2 left-1/2 mx-2 flex -translate-x-1/2 flex-row gap-2 rounded-box bg-base-100/95 px-2 py-1 shadow"
	>
		{#each tools as tool (tool.state)}
			{@const Icon = tool.icon}
			<li>
				<button
					onclick={() => setActive(tool.state)}
					aria-label={tool.kbShortcut}
					class="btn relative btn-square text-base-content btn-ghost btn-sm btn-secondary
						   {tool.state === app.editor.currentState?.name ? 'btn-active' : ''}"
				>
					<Icon class="h-4 w-4" />
					<small class="absolute right-0 -bottom-0.5 align-sub">{tool.kbShortcut}</small>
				</button>
			</li>
		{/each}
	</ul>

	<div class="absolute top-2 right-2">
		<SelectedItemPanel selectionManager={app.editor.selectionManager} />
	</div>

	<div
		class="absolute bottom-2 left-2 flex h-10 items-center rounded-box bg-base-100/95 px-3 py-2 text-sm shadow"
	>
		<span>
			Nodes: {app.editor.fsaGraph.nodes.length} | Edges: {app.editor.fsaGraph.edges.length}
		</span>
	</div>
	<div
		class="absolute right-2 bottom-2 flex h-10 items-center gap-0.5 rounded-box bg-base-100/95 px-3 py-2 text-sm shadow"
	>
		<span class="mr-2">{app.editor.viewportManager.prettyZoomLevel}</span>

		<button
			class="btn btn-square btn-ghost btn-sm"
			onclick={() => app.editor.viewportManager.adjustZoom(0.1)}
			aria-label="Zoom In"
		>
			<Plus class="h-4 w-4" />
		</button>
		<button
			class="btn btn-square btn-ghost btn-sm"
			onclick={() => app.editor.viewportManager.adjustZoom(-0.1)}
			aria-label="Zoom Out"
		>
			<Minus class="h-4 w-4" />
		</button>
	</div>
</section>
