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
		ComputeInputWindow,
		SimulationControls
	} from '$lib/ui';
	import {
		AddNodeState,
		SelectState,
		DrawEdgeState,
		PanningState,
		SingleSelectState
	} from '$lib/interaction/editor/states';
	import { WINDOWS_ID } from '$lib/interaction/Windows.svelte';
	import { notifyInfo, notifyError } from '$lib/utils/notifications';
	import { DeleteFSAItemsCommand } from '$lib/interaction/editor/commands/instances';
	import { DraftEdgeHandler, type EditorContext } from '$lib/interaction/editor';
	import { State, StateMachine } from '$lib/interaction';

	const editorCtx: EditorContext = {
		fsaGraph: app.fsaGraph,
		viewport: app.viewport,
		commandHistory: app.commandHistory,
		selection: app.selectionHandler,
		draftEdge: new DraftEdgeHandler(app.fsaGraph)
	};

	interface Tool {
		stateName: string;
		kbShortcut: string;
		icon: typeof IconType;
	}

	interface ModeConfig {
		stateMachine: StateMachine<State>;
		tools: Tool[];
		keydownHandler: (e: KeyboardEvent) => void;
	}

	const editorStateMachine = new StateMachine(
		[
			new PanningState(editorCtx),
			new SelectState(editorCtx),
			new DrawEdgeState(editorCtx),
			new AddNodeState(editorCtx)
		],
		SelectState.NAME
	);

	const editorTools: Tool[] = [
		{ stateName: PanningState.NAME, kbShortcut: '1', icon: Hand },
		{ stateName: SelectState.NAME, kbShortcut: '2', icon: MousePointer },
		{ stateName: DrawEdgeState.NAME, kbShortcut: '3', icon: Spline },
		{ stateName: AddNodeState.NAME, kbShortcut: '4', icon: CirclePlus }
	];

	function handleEditorKeyDown(e: KeyboardEvent) {
		if (isTyping(e)) return;
		const tool = editorTools.find((a) => a.kbShortcut === e.key);
		if (tool) {
			e.preventDefault();
			editorStateMachine.transitionTo(tool.stateName);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			editorCtx.selection.clear();
		} else if (e.key === 'Delete') {
			e.preventDefault();
			const toDelete = editorCtx.selection.items.map((item) => item.id);
			if (toDelete.length === 0) return;
			const command = new DeleteFSAItemsCommand(...toDelete);
			editorCtx.commandHistory.pushAndExecute(command);
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
			e.preventDefault();
			undoCommand();
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
			e.preventDefault();
			redoCommand();
		}
	}

	const simulationStateMachine = new StateMachine(
		[new PanningState(editorCtx), new SingleSelectState(editorCtx)],
		SingleSelectState.NAME
	);

	const simulationTools: Tool[] = [
		{ stateName: PanningState.NAME, kbShortcut: '1', icon: Hand },
		{ stateName: SingleSelectState.NAME, kbShortcut: '2', icon: MousePointer }
	];

	function handleSimulationKeyDown(e: KeyboardEvent) {
		if (isTyping(e)) return;
		const tool = simulationTools.find((a) => a.kbShortcut === e.key);
		if (tool) {
			e.preventDefault();
			simulationStateMachine.transitionTo(tool.stateName);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			editorCtx.selection.clear();
		}
	}

	const editorConfig: ModeConfig = {
		stateMachine: editorStateMachine,
		tools: editorTools,
		keydownHandler: handleEditorKeyDown
	};

	const simulationConfig: ModeConfig = {
		stateMachine: simulationStateMachine,
		tools: simulationTools,
		keydownHandler: handleSimulationKeyDown
	};

	const activeMode = $derived(app.isEditing() ? editorConfig : simulationConfig);

	// prevent interfering with input fields
	function isTyping(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		return (
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'SELECT' ||
			target.isContentEditable
		);
	}

	function undoCommand() {
		const command = editorCtx.commandHistory.peekUndo();
		try {
			if (!editorCtx.commandHistory.canUndo) return;
			editorCtx.commandHistory.undo();
			notifyInfo(`Undone '${command}' command.`);
		} catch (error) {
			notifyError(`Failed to undo command '${command}'`);
			console.error('Error during undo:', error);
		}
	}

	function redoCommand() {
		const command = editorCtx.commandHistory.peekRedo();
		try {
			if (!editorCtx.commandHistory.canRedo) return;
			editorCtx.commandHistory.redo();
			notifyInfo(`Redone '${command}' command.`);
		} catch (error) {
			notifyError(`Failed to redo command '${command}'`);
			console.error('Error during redo:', error);
		}
	}

	function getItemClass(itemId: string) {
		let itemClass = '';
		if (editorCtx.selection.isSelected(itemId)) itemClass += 'selected ';
		if (editorCtx.selection.isInArea(itemId)) itemClass += 'in-selection-area';
		return itemClass;
	}

	onMount(() => {
		app.windows.open(WINDOWS_ID.Selection); // open selection panel by default
		window.addEventListener('keydown', activeMode.keydownHandler);
		return () => window.removeEventListener('keydown', activeMode.keydownHandler);
	});
</script>

<section class="relative h-full w-full overflow-hidden">
	<DrawingBoard
		fsa={editorCtx.fsaGraph}
		viewport={editorCtx.viewport}
		currentState={activeMode.stateMachine?.currentState}
		getItemClass={(item) => getItemClass(item.id)}
	>
		{#snippet overlay()}
			{#if app.isEditing()}
				{#if editorCtx.draftEdge.get}
					<DraftEdgeSvg draftEdge={editorCtx.draftEdge.get} />
				{/if}

				{#if editorCtx.selection.area}
					{@const { start, end } = editorCtx.selection.area}
					<SelectionArea {start} {end} />
				{/if}
			{/if}
		{/snippet}
	</DrawingBoard>

	<!-- Top-center controls -->
	<div class="absolute top-2 left-1/2 flex -translate-x-1/2 items-center gap-2">
		<!-- Toolbar -->
		<ul class="mx-2 flex flex-row gap-2 rounded-box bg-base-100/95 px-2 py-1 shadow">
			{#each activeMode.tools as tool (tool.stateName)}
				{@const Icon = tool.icon}
				<li>
					<button
						onclick={() => activeMode.stateMachine.transitionTo(tool.stateName)}
						aria-label={tool.kbShortcut}
						class="btn relative btn-square text-base-content btn-ghost btn-sm btn-secondary
							{tool.stateName === activeMode.stateMachine.currentState.name ? 'btn-active' : ''}"
					>
						<Icon class="h-4 w-4" />
						<small class="absolute right-0 -bottom-0.5 align-sub">{tool.kbShortcut}</small>
					</button>
				</li>
			{/each}
		</ul>

		{#if app.isSimulating()}
			<SimulationControls onExit={() => app.exitSimulation()} />
		{/if}
	</div>

	<!-- Undo/Redo controls -->
	{#if app.isEditing()}
		<div
			class="absolute top-2 right-2 flex h-10 items-center gap-0.5 rounded-box bg-base-100/95 px-3 py-2 text-sm shadow"
		>
			<UndoRedoControls
				onUndo={undoCommand}
				onRedo={redoCommand}
				canUndo={editorCtx.commandHistory.canUndo}
				canRedo={editorCtx.commandHistory.canRedo}
			/>
		</div>
	{/if}

	<!-- Graph info panel -->
	<div
		class="absolute bottom-2 left-2 flex h-10 items-center rounded-box bg-base-100/95 px-3 py-2 text-sm shadow"
	>
		<span>
			{editorCtx.fsaGraph.type}
			| Nodes: {editorCtx.fsaGraph.nodes.length}
			| Edges: {editorCtx.fsaGraph.edges.length}
		</span>
	</div>

	<!-- Zoom controls -->
	<div
		class="absolute right-2 bottom-2 flex h-10 items-center gap-0.5 rounded-box bg-base-100/95 px-3 py-2 text-sm shadow"
	>
		<ZoomControls viewport={editorCtx.viewport} />
	</div>

	{#if app.isEditing()}
		{#if app.windows.isOpen(WINDOWS_ID.TransitionTable)}
			<TransitionTableWindow />
		{/if}
		{#if app.windows.isOpen(WINDOWS_ID.ComputeInput)}
			<ComputeInputWindow />
		{/if}
		{#if app.windows.isOpen(WINDOWS_ID.Selection)}
			<SelectionWindow editor={editorCtx} />
		{/if}
	{/if}
</section>
