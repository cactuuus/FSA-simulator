<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { CirclePlus, Spline, Hand, MousePointer, BookOpen } from '@lucide/svelte';
	import { app } from '$lib/stores/app.svelte';
	import { TransitionTableWindow } from '$lib/transition-table';
	import { SelectionArea, SelectionPanel } from '$lib/editor/selection';
	import { ZoomControls } from '$lib/editor/viewport';
	import { ComputeInputWindow, SimulationScene, SimulationControls } from '$lib/simulation';
	import { DrawingBoard } from '$lib/graph-rendering';
	import {
		AddNodeState,
		SelectState,
		DrawEdgeState,
		PanningState,
		type State,
		StateMachine,
		StatesToolbar,
		type Tool
	} from '$lib/editor/states';
	import { WINDOWS_ID } from '$lib/windows/Windows.svelte';
	import { DeleteFSAItemsCommand, UndoRedoControls } from '$lib/editor/commands';
	import { type EditorContext } from '$lib/editor/EditorContext';
	import { DraftEdgeHandler, DraftEdgeSvg } from '$lib/editor/draft-edge';
	import { isTyping } from '$lib/utils/keyboard';
	import { toggleInSelectionArea, toggleSelected } from '$lib/utils/graphEffects';
	import MainMenu from '$lib/menu/MainMenu.svelte';
	import { AutomatonInfoWindow } from '$lib/automaton-info';
	import { manualHref } from '$lib/utils/manual';

	const editorCtx: EditorContext = {
		fsaGraph: app.fsaGraph,
		viewport: app.viewport,
		commandHistory: app.commandHistory,
		selection: app.selectionHandler,
		draftEdge: new DraftEdgeHandler(app.fsaGraph)
	};
	const tools: Tool[] = [
		{ stateName: PanningState.NAME, kbShortcut: '1', icon: Hand, title: 'Pan (1)' },
		{ stateName: SelectState.NAME, kbShortcut: '2', icon: MousePointer, title: 'Select (2)' },
		{ stateName: DrawEdgeState.NAME, kbShortcut: '3', icon: Spline, title: 'Draw Edge (3)' },
		{ stateName: AddNodeState.NAME, kbShortcut: '4', icon: CirclePlus, title: 'Add State (4)' }
	];
	const stateMachine = new StateMachine(
		[
			new PanningState(editorCtx),
			new SelectState(editorCtx),
			new DrawEdgeState(editorCtx),
			new AddNodeState(editorCtx, () => {
				stateMachine.transitionTo(SelectState.NAME);
			})
		],
		SelectState.NAME
	);

	function handleKeyDown(e: KeyboardEvent) {
		// escape always clears selection
		if (e.key === 'Escape') {
			e.preventDefault();
			editorCtx.selection.clear();
		}
		// ignore other keys if user is engaging with other fields
		if (!isTyping(e) && !app.isSimulating()) {
			if (e.key === 'Delete') {
				e.preventDefault();
				const toDelete = editorCtx.selection.items.map((item) => item.id);
				if (toDelete.length === 0) return;
				const command = new DeleteFSAItemsCommand(...toDelete);
				editorCtx.commandHistory.pushAndExecute(command);
			}
		}
	}

	let previousState = $state<State>(stateMachine.currentState);
	// Switches to panning state when simulation starts, and back to previous state when it ends
	$effect(() => {
		if (app.isSimulating()) {
			untrack(() => {
				previousState = stateMachine.currentState;
				stateMachine.transitionTo(PanningState.NAME);
				editorCtx.selection.clear();
			});
		} else {
			untrack(() => {
				stateMachine.transitionTo(previousState.name);
			});
		}
	});

	// Highlights items selected
	$effect(() => {
		void editorCtx.selection.items; // track changes in selection
		untrack(() => {
			app.fsaGraph.nodes.forEach((node) => {
				const isSelected = editorCtx.selection.isSelected(node.id);
				toggleSelected(isSelected, node.id);
			});
			app.fsaGraph.edges.forEach((edge) => {
				const isSelected = editorCtx.selection.isSelected(edge.id);
				toggleSelected(isSelected, edge.id);
			});
		});
	});

	// Highlights items in the selection area
	$effect(() => {
		void editorCtx.selection.itemsInArea; // track changes in selection area
		app.fsaGraph.nodes.forEach((node) => {
			const isInSelectionArea = editorCtx.selection.isInArea(node.id);
			toggleInSelectionArea(isInSelectionArea, node.id);
		});
		app.fsaGraph.edges.forEach((edge) => {
			const isInSelectionArea = editorCtx.selection.isInArea(edge.id);
			toggleInSelectionArea(isInSelectionArea, edge.id);
		});
	});

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<section class="relative h-full w-full overflow-hidden">
	<DrawingBoard
		fsa={editorCtx.fsaGraph}
		viewport={editorCtx.viewport}
		currentState={stateMachine.currentState}
	>
		{#snippet overlay()}
			{#if !app.isSimulating()}
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

	{#if app.isSimulating()}
		<SimulationScene fsa={app.fsaGraph} controller={app.simulationController} />
	{/if}

	<!-- Top-left -->
	<div class="controls-container top-2 left-2 flex items-center gap-2">
		<!-- Main menu -->
		<MainMenu simulationActive={app.isSimulating()} />
	</div>

	<!-- Bottom-left -->
	<div class="controls-container bottom-2 left-2 flex items-center gap-2">
		<!-- Undo/redo controls -->
		{#if !app.isSimulating()}
			<UndoRedoControls commandHistory={editorCtx.commandHistory} />
		{/if}
	</div>

	<!-- Top-center controls -->
	<div class="controls-container top-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
		{#if app.isSimulating()}
			<!-- Simulation controls -->
			<SimulationControls controller={app.simulationController} />
			<!-- fixes a production build reactivity bug, do not remove -->
			{void app.isSimulating()}
			<!-- No idea what causes it, but without that line (or any line that triggers reactivity)
			 the simulation controls don't render when switching from simulation to editing and back to
			 simulation. Weird thing is: logs inside the component still print in the console, like
			 everything is fine, but the element doesn't show up in the DOM (???).
			-->
		{:else}
			<!-- Toolbar -->
			<StatesToolbar {tools} {stateMachine} />
		{/if}
	</div>

	<!-- Top-right manual button -->
	<a
		href={manualHref()}
		target="_blank"
		class="controls-container controls top-2 right-2"
		title="Open manual"
	>
		<div class="btn btn-square h-10 gap-2 rounded-box text-primary btn-ghost hover:text-secondary">
			<BookOpen class="h-4 w-4" />
		</div>
	</a>

	<!-- Bottom-right zoom controls -->
	<div class="controls-container right-2 bottom-2">
		<ZoomControls viewport={editorCtx.viewport} />
	</div>

	{#if !app.isSimulating()}
		{#if app.windows.isOpen(WINDOWS_ID.TransitionTable)}
			<TransitionTableWindow />
		{/if}
		{#if app.windows.isOpen(WINDOWS_ID.ComputeInput)}
			<ComputeInputWindow />
		{/if}
		<SelectionPanel editor={editorCtx} />
		{#if app.windows.isOpen(WINDOWS_ID.AutomatonInfo)}
			<AutomatonInfoWindow />
		{/if}
	{/if}
</section>
