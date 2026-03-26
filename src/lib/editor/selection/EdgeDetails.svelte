<script lang="ts">
	import { X, Plus, Redo2, TriangleAlert } from '@lucide/svelte';
	import { Edge, Transition, FSAGraph } from '$lib/automata-models';
	import {
		CommandHistory,
		AddTransitionCommand,
		DeleteTransitionsCommand,
		AdjustEdgeShapeCommand,
		UpdateTransitionCommand,
		type UpdateTransitionData
	} from '../commands';

	const {
		edge,
		fsaGraph,
		commandHistory
	}: { edge: Edge; fsaGraph: FSAGraph; commandHistory: CommandHistory } = $props();
	const canDeleteTransition = $derived(edge.transitions.length > 1);
	let beforeEditTransitionValues: {
		rawConsume: string;
		rawPop: string | null;
		rawPush: string | null;
	};

	function addTransition() {
		const command = new AddTransitionCommand(edge.id, fsaGraph.hasStackOps);
		commandHistory.pushAndExecute(command);
	}

	function removeTransition(transitionId: string) {
		const command = new DeleteTransitionsCommand(transitionId);
		commandHistory.pushAndExecute(command);
	}

	function resetShape() {
		if (edge.hasDefaultControlPoint) return; // No need to reset if it's already in default shape
		const previousControlPoint = edge.controlPoint;
		edge.resetControlPoint();
		const command = new AdjustEdgeShapeCommand(edge.id, previousControlPoint, edge.controlPoint);
		commandHistory.push(command);
	}

	function setTransitionInitialValues(transition: Transition) {
		beforeEditTransitionValues = {
			rawConsume: transition.consumeRawValue,
			rawPop: transition.popRawValue,
			rawPush: transition.pushRawValue
		};
	}

	function updateTransition(transition: Transition) {
		const toRawValues = {
			rawConsume: transition.consumeRawValue,
			rawPop: transition.popRawValue,
			rawPush: transition.pushRawValue
		};
		const transitionData: UpdateTransitionData = {
			transitionId: transition.id,
			from: beforeEditTransitionValues,
			to: toRawValues
		};
		const command = new UpdateTransitionCommand(transitionData);
		commandHistory.pushAndExecute(command);
	}
</script>

<div class="flex w-full flex-col gap-3">
	<!-- Transitions section -->
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h2>Transitions</h2>
			<button
				class="btn gap-1 btn-ghost btn-sm btn-success"
				onclick={addTransition}
				title="Add new transition"
			>
				<Plus class="h-3 w-3" />
				Add
			</button>
		</div>

		{#if edge.duplicateTransitionIds.size > 0}
			<div class="alert flex w-full justify-center alert-soft px-2 py-1 font-semibold alert-error">
				<TriangleAlert class="h-4 w-4" />
				Duplicates detected!
			</div>
		{/if}

		<div class="flex max-h-80 flex-col gap-1 overflow-y-auto">
			{#each edge.transitions as transition (transition.id)}
				{@const isDuplicate = edge.duplicateTransitionIds.has(transition.id)}
				<div
					class="flex items-center gap-1 rounded-md px-2 py-1 {isDuplicate
						? 'bg-error/10'
						: 'bg-base-content/10'}"
				>
					<!-- FSA: single input. PDA: three inputs with inline separators -->
					{#if fsaGraph.hasStackOps}
						<input
							type="text"
							class="input-bordered input"
							class:input-error={isDuplicate}
							bind:value={transition.consumeRawValue}
							placeholder={Transition.EPSILON}
							onblur={() => updateTransition(transition)}
							onfocus={() => setTransitionInitialValues(transition)}
							title="Symbol read"
						/>
						<span>,</span>
						<input
							type="text"
							class="input-bordered input"
							class:input-error={isDuplicate}
							bind:value={transition.popRawValue}
							placeholder={Transition.EPSILON}
							onblur={() => updateTransition(transition)}
							onfocus={() => setTransitionInitialValues(transition)}
							title="Symbol popped (PDA only)"
						/>
						<span>⟶</span>
						<input
							type="text"
							class="input-bordered input"
							class:input-error={isDuplicate}
							bind:value={transition.pushRawValue}
							placeholder={Transition.EPSILON}
							onblur={() => updateTransition(transition)}
							onfocus={() => setTransitionInitialValues(transition)}
							title="Symbol pushed (PDA only)"
						/>
					{:else}
						<input
							type="text"
							class="input-bordered input"
							class:input-error={isDuplicate}
							bind:value={transition.consumeRawValue}
							placeholder={Transition.EPSILON}
							onblur={() => updateTransition(transition)}
							onfocus={() => setTransitionInitialValues(transition)}
							title="Symbol read"
						/>
					{/if}

					<!-- Remove button -->
					<button
						class="btn btn-square btn-ghost btn-sm btn-error"
						onclick={() => removeTransition(transition.id)}
						title="Remove transition"
						disabled={!canDeleteTransition}
					>
						<X class="h-3 w-3" />
					</button>
				</div>
			{/each}
		</div>
	</div>

	<hr class="border-base-content/30" />

	<!-- Edge shape section -->
	<button class="btn btn-sm" onclick={resetShape} disabled={edge.hasDefaultControlPoint}>
		<Redo2 class="h-4 w-4" />
		{edge.isLoopback ? 'Reset Rotation' : 'Reset Shape'}
	</button>
</div>
