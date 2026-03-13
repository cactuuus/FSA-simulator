<script lang="ts">
	import { X, Plus, CircleQuestionMark, Redo2 } from '@lucide/svelte';
	import { Edge, Transition, FSAGraph } from '$lib/automata-models';
	import {
		CommandHistory,
		AddTransitionCommand,
		DeleteTransitionsCommand,
		AdjustEdgeShapeCommand,
		ToggleEdgeSymmetricCommand,
		UpdateTransitionCommand
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

	function toggleSymmetry() {
		const command = new ToggleEdgeSymmetricCommand(edge.id, !edge.isSymmetric);
		commandHistory.pushAndExecute(command);
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
		const command = new UpdateTransitionCommand(
			transition.id,
			beforeEditTransitionValues,
			toRawValues
		);
		commandHistory.pushAndExecute(command);
	}
</script>

<div class="flex w-full flex-col gap-3">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h2>Transitions</h2>
			<div
				class="badge flex cursor-help items-center badge-soft badge-sm badge-info"
				title="PDA mode allows to use stack operations (pop & push) in transitions. You can toggle it in 'Menu -> FSA -> Enable/Disable stack'"
			>
				<span>PDA {fsaGraph.hasStackOps ? 'enabled' : 'disabled'}</span>
				<CircleQuestionMark class="h-4 w-4 pb-0.5" />
			</div>
		</div>
		<div class="flex flex-col gap-2">
			{#each edge.transitions as transition, index (index)}
				<fieldset class="fieldset flex items-end gap-2 rounded-box bg-base-300 p-2">
					<legend class="fieldset-legend w-full py-0">
						<span class="badge border-0 bg-base-300 badge-sm">
							{transition.toString()}
						</span>
						<button
							class="btn float-right btn-xs btn-error"
							onclick={() => removeTransition(transition.id)}
							title="Remove this transition"
							disabled={!canDeleteTransition}
						>
							<X class="h-4 w-4" /> Remove
						</button>
					</legend>
					<label for="consume-{transition.id}" class="flex-1">
						Consume
						<input
							id="consume-{transition.id}"
							type="text"
							class="input-bordered input mt-1 w-full"
							bind:value={transition.consumeRawValue}
							placeholder={Transition.EPSILON}
							onblur={() => updateTransition(transition)}
							onfocus={() => setTransitionInitialValues(transition)}
						/>
					</label>
					{#if fsaGraph.hasStackOps}
						<label for="pop-{transition.id}" class="flex-1">
							Pop (PDA)
							<input
								id="pop-{transition.id}"
								type="text"
								class="input-bordered input mt-1 w-full"
								bind:value={transition.popRawValue}
								placeholder={Transition.EPSILON}
								onblur={() => updateTransition(transition)}
								onfocus={() => setTransitionInitialValues(transition)}
							/>
						</label>
						<label for="push-{transition.id}" class="flex-1">
							Push (PDA)
							<input
								id="push-{transition.id}"
								type="text"
								class="input-bordered input mt-1 w-full"
								bind:value={transition.pushRawValue}
								placeholder={Transition.EPSILON}
								onblur={() => updateTransition(transition)}
								onfocus={() => setTransitionInitialValues(transition)}
							/>
						</label>
					{/if}
				</fieldset>
			{/each}
		</div>
	</div>
	<button class="btn btn-sm btn-success" onclick={addTransition}>
		<Plus class="h-4 w-4" /> Add transition
	</button>

	<hr class="border-base-content/30" />
	{#if !edge.isLoopback}
		<label for="toggle-symmetric-edge" class="flex items-center justify-between gap-2">
			Is Symmetric
			<input
				id="toggle-symmetric-edge"
				type="checkbox"
				class="checkbox checkbox-sm checkbox-success"
				onchange={toggleSymmetry}
				checked={edge.isSymmetric}
			/>
		</label>
	{/if}
	<button class="btn btn-sm" onclick={resetShape} disabled={edge.hasDefaultControlPoint}>
		<Redo2 class="h-4 w-4" />
		{edge.isLoopback ? 'Reset Rotation' : 'Reset Shape'}
	</button>
</div>
