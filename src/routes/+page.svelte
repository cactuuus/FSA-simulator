<script lang="ts">
	import { onMount } from 'svelte';
	import { CirclePlus, Spline, Hand, MousePointer, type Icon as IconType } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import {
		DrawingBoard,
		SelectionWindow,
		TransitionTableWindow,
		DraftEdgeSvg,
		SelectionArea,
		ZoomControls,
		UndoRedoControls,
		ComputeInputWindow
	} from '$lib/ui';
	import {
		AddNodeState,
		SelectState,
		DrawEdgeState,
		PanningState
	} from '$lib/interaction/editor/states';
	import { WINDOWS_ID } from '$lib/interaction/Windows.svelte';
	import { notifyInfo, notifyError } from '$lib/utils/notifications';
	import { DeleteFSAItemsCommand } from '$lib/interaction/editor/commands/instances';
	import { DraftEdgeHandler, type EditorContext } from '$lib/interaction/editor';
	import { StateMachine } from '$lib/interaction';

	const editor: EditorContext = {
		fsaGraph: app.fsaGraph,
		viewport: app.viewport,
		commandHistory: app.commandHistory,
		selection: app.selectionHandler,
		draftEdge: new DraftEdgeHandler(app.fsaGraph)
	};

	const stateMachine = new StateMachine(
		[
			new PanningState(editor),
			new SelectState(editor),
			new DrawEdgeState(editor),
			new AddNodeState(editor)
		],
		SelectState.NAME
	);

	interface Tool {
		stateName: string;
		kbShortcut: string;
		icon: typeof IconType;
	}

	/**
	 * Toolbar tools configuration.
	 */
	const tools: Tool[] = [
		{ stateName: PanningState.NAME, kbShortcut: '1', icon: Hand },
		{ stateName: SelectState.NAME, kbShortcut: '2', icon: MousePointer },
		{ stateName: DrawEdgeState.NAME, kbShortcut: '3', icon: Spline },
		{ stateName: AddNodeState.NAME, kbShortcut: '4', icon: CirclePlus }
	];

	function toState(stateName: string) {
		stateMachine.transitionTo(stateName);
	}

	function undoCommand() {
		const command = editor.commandHistory.peekUndo();
		try {
			if (!editor.commandHistory.canUndo) return;
			editor.commandHistory.undo();
			notifyInfo(`Undone '${command}' command.`);
		} catch (error) {
			notifyError(`Failed to undo command '${command}'`);
			console.error('Error during undo:', error);
		}
	}

	function redoCommand() {
		const command = editor.commandHistory.peekRedo();
		try {
			if (!editor.commandHistory.canRedo) return;
			editor.commandHistory.redo();
			notifyInfo(`Redone '${command}' command.`);
		} catch (error) {
			notifyError(`Failed to redo command '${command}'`);
			console.error('Error during redo:', error);
		}
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
			toState(tool.stateName);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			editor.selection.clear();
		} else if (e.key === 'Delete') {
			e.preventDefault();
			const toDelete = editor.selection.items.map((item) => item.id);
			if (toDelete.length === 0) return;
			const command = new DeleteFSAItemsCommand(...toDelete);
			editor.commandHistory.pushAndExecute(command);
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
			e.preventDefault();
			undoCommand();
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
			e.preventDefault();
			redoCommand();
		}
	}

	function getItemClass(itemId: string) {
		let itemClass = '';
		if (editor.selection.isSelected(itemId)) itemClass += 'selected ';
		if (editor.selection.isInArea(itemId)) itemClass += 'in-selection-area';
		return itemClass;
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<section class="relative h-full w-full overflow-hidden">
	<DrawingBoard
		fsa={editor.fsaGraph}
		viewport={editor.viewport}
		currentState={stateMachine.currentState}
		getItemClass={(item) => getItemClass(item.id)}
	>
		{#snippet overlay()}
			{#if editor.draftEdge.get}
				<DraftEdgeSvg draftEdge={editor.draftEdge.get} />
			{/if}

			{#if editor.selection.area}
				{@const { start, end } = editor.selection.area}
				<SelectionArea {start} {end} />
			{/if}
		{/snippet}
	</DrawingBoard>

	<!-- Toolbar -->
	<ul
		class="absolute top-2 left-1/2 mx-2 flex -translate-x-1/2 flex-row gap-2 rounded-box bg-base-100/95 px-2 py-1 shadow"
	>
		{#each tools as tool (tool.stateName)}
			{@const Icon = tool.icon}
			<li>
				<button
					onclick={() => toState(tool.stateName)}
					aria-label={tool.kbShortcut}
					class="btn relative btn-square text-base-content btn-ghost btn-sm btn-secondary
							{tool.stateName === stateMachine.currentState.name ? 'btn-active' : ''}"
				>
					<Icon class="h-4 w-4" />
					<small class="absolute right-0 -bottom-0.5 align-sub">{tool.kbShortcut}</small>
				</button>
			</li>
		{/each}
	</ul>

	<!-- Undo/Redo controls -->
	<div
		class="absolute top-2 right-2 flex h-10 items-center gap-0.5 rounded-box bg-base-100/95 px-3 py-2 text-sm shadow"
	>
		<UndoRedoControls
			onUndo={undoCommand}
			onRedo={redoCommand}
			canUndo={editor.commandHistory.canUndo}
			canRedo={editor.commandHistory.canRedo}
		/>
	</div>

	<!-- Graph info panel -->
	<div
		class="absolute bottom-2 left-2 flex h-10 items-center rounded-box bg-base-100/95 px-3 py-2 text-sm shadow"
	>
		<span>
			{editor.fsaGraph.type}
			| Nodes: {editor.fsaGraph.nodes.length}
			| Edges: {editor.fsaGraph.edges.length}
		</span>
	</div>

	<!-- Zoom controls -->
	<div
		class="absolute right-2 bottom-2 flex h-10 items-center gap-0.5 rounded-box bg-base-100/95 px-3 py-2 text-sm shadow"
	>
		<ZoomControls viewport={editor.viewport} />
	</div>

	{#if app.windows.isOpen(WINDOWS_ID.TransitionTable)}
		<TransitionTableWindow />
	{/if}

	{#if app.windows.isOpen(WINDOWS_ID.ComputeInput)}
		<ComputeInputWindow />
	{/if}

	<!-- Instance of selection panel always present -->
	<SelectionWindow {editor} window={app.windows.open(WINDOWS_ID.Selection)!} />
</section>
