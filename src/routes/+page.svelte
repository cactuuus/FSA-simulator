<script lang="ts">
	import { onMount } from 'svelte';
	import { CirclePlus, Spline, Hand, MousePointer } from '@lucide/svelte';
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
	import { GraphInfoWindow } from '$lib/graph-info';

	const editorCtx: EditorContext = {
		fsaGraph: app.fsaGraph,
		viewport: app.viewport,
		commandHistory: app.commandHistory,
		selection: app.selectionHandler,
		draftEdge: new DraftEdgeHandler(app.fsaGraph)
	};

	interface ModeConfig {
		stateMachine: StateMachine<State>;
		tools: Tool[];
		keydownHandler: (_e: KeyboardEvent) => void;
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
		{ stateName: PanningState.NAME, kbShortcut: '1', icon: Hand, title: 'Pan (1)' },
		{ stateName: SelectState.NAME, kbShortcut: '2', icon: MousePointer, title: 'Select (2)' },
		{ stateName: DrawEdgeState.NAME, kbShortcut: '3', icon: Spline, title: 'Draw Edge (3)' },
		{ stateName: AddNodeState.NAME, kbShortcut: '4', icon: CirclePlus, title: 'Add Node (4)' }
	];

	function handleEditorKeyDown(e: KeyboardEvent) {
		if (e.key === 'Delete') {
			e.preventDefault();
			const toDelete = editorCtx.selection.items.map((item) => item.id);
			if (toDelete.length === 0) return;
			const command = new DeleteFSAItemsCommand(...toDelete);
			editorCtx.commandHistory.pushAndExecute(command);
		}
	}

	const simulationStateMachine = new StateMachine(
		[new PanningState(editorCtx), new SelectState(editorCtx)],
		SelectState.NAME
	);

	const simulationTools: Tool[] = [
		{ stateName: PanningState.NAME, kbShortcut: '1', icon: Hand, title: 'Pan (1)' },
		{ stateName: SelectState.NAME, kbShortcut: '2', icon: MousePointer, title: 'Select (2)' }
	];

	function handleSimulationKeyDown(_e: KeyboardEvent) {
		// nothing here yet
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

	function handleKeyDown(e: KeyboardEvent) {
		// global shortcuts that work regardless of the current mode
		if (isTyping(e)) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			editorCtx.selection.clear();
		} else {
			// delegate to active mode's specific keydown handler
			activeMode.keydownHandler(e);
		}
	}

	// Highlights items selected
	$effect(() => {
		app.fsaGraph.nodes.forEach((node) => {
			const isSelected = editorCtx.selection.isSelected(node.id);
			toggleSelected(isSelected, node.id);
		});
		app.fsaGraph.edges.forEach((edge) => {
			const isSelected = editorCtx.selection.isSelected(edge.id);
			toggleSelected(isSelected, edge.id);
		});
	});

	// Highlights items in the selection area
	$effect(() => {
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
		currentState={activeMode.stateMachine?.currentState}
	>
		{#snippet overlay()}
			{#if app.isEditing()}
				{#if editorCtx.draftEdge.get}
					<DraftEdgeSvg draftEdge={editorCtx.draftEdge.get} />
				{/if}
			{/if}
			{#if editorCtx.selection.area}
				{@const { start, end } = editorCtx.selection.area}
				<SelectionArea {start} {end} />
			{/if}
		{/snippet}
	</DrawingBoard>

	{#if app.isSimulating()}
		<SimulationScene fsa={app.fsaGraph} controller={app.simulationController} />
	{/if}

	<!-- Top-left menu -->
	<div class="controls-container top-2 left-2">
		<MainMenu simulationActive={app.isSimulating()} />
	</div>

	<!-- Top-center controls -->
	<div class="controls-container top-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
		{#if app.isSimulating()}
			<!-- Toolbar + simulation controls -->
			<!-- For some reason, if we get rid of the else block and simply place the StatesToolbar outside
			 (since it is always rendered) it breaks reactivity and StatesToolbar doesn't render in specific
			 instances when exiting and re-entering the simulation. This only happens in a production build,
			 not in dev, which makes it even harder to track/fix.
			 No idea what causes it, possibly some bug during compilation. Weird thing is: logs inside the
			 component still print in the console, like everything is fine, but the element doesn't show up
			 in the DOM (???).
			-->
			<StatesToolbar tools={activeMode.tools} stateMachine={activeMode.stateMachine} />
			<SimulationControls controller={app.simulationController} />
		{:else}
			<!-- Toolbar -->
			<StatesToolbar tools={activeMode.tools} stateMachine={activeMode.stateMachine} />
		{/if}
	</div>

	<div class="controls-container top-2 right-2">
		<!-- Undo/Redo controls -->
		{#if app.isEditing()}
			<UndoRedoControls commandHistory={editorCtx.commandHistory} />
		{/if}
	</div>

	<!-- Zoom controls -->
	<div class="controls-container right-2 bottom-2">
		<ZoomControls viewport={editorCtx.viewport} />
	</div>

	{#if app.isEditing()}
		{#if app.windows.isOpen(WINDOWS_ID.TransitionTable)}
			<TransitionTableWindow />
		{/if}
		{#if app.windows.isOpen(WINDOWS_ID.ComputeInput)}
			<ComputeInputWindow />
		{/if}
		{#if app.isEditing()}
			<SelectionPanel editor={editorCtx} />
		{/if}
		{#if app.windows.isOpen(WINDOWS_ID.GraphInfo)}
			<GraphInfoWindow />
		{/if}
	{/if}
</section>
