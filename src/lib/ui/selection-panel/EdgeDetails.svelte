<script lang="ts">
	import { X, Plus, CircleQuestionMark } from '@lucide/svelte';
	import { Transition, type Edge, FSAGraph } from '$lib/automata/models';
	import {
		AddTransitionCommand,
		DeleteTransitionsCommand,
		ToggleEdgeAlignCenterCommand,
		ToggleEdgeStraightCommand
	} from '$lib/interaction/editor/commands';
	import { CommandHistory } from '$lib/interaction/editor/CommandHistory.svelte';

	const {
		edge,
		fsaGraph,
		commandHistory
	}: { edge: Edge; fsaGraph: FSAGraph; commandHistory: CommandHistory } = $props();
	const canDeleteTransition = $derived(edge.transitions.length > 1);

	function addTransition() {
		const command = new AddTransitionCommand(edge.id, fsaGraph.hasStackOps);
		commandHistory.pushAndExecute(command);
	}

	function removeTransition(transitionId: string) {
		const command = new DeleteTransitionsCommand(transitionId);
		commandHistory.pushAndExecute(command);
	}

	function toggleForceStraight() {
		const command = new ToggleEdgeStraightCommand(edge.id, !edge.forceStraight);
		commandHistory.pushAndExecute(command);
	}

	function toggleForceAlignCenter() {
		const command = new ToggleEdgeAlignCenterCommand(edge.id, !edge.forceAlignCenter);
		commandHistory.pushAndExecute(command);
	}
</script>

<div class="flex w-full flex-col gap-4">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h2>Transitions</h2>
			<div
				class="badge flex cursor-help items-center badge-sm badge-neutral"
				title="PDA mode allows to use stack operations (pop & push) in transitions. You can toggle it in 'FSA -> Enable/Disable PDA mode'"
			>
				<span>PDA {fsaGraph.hasStackOps ? 'enabled' : 'disabled'}</span>
				<CircleQuestionMark class="h-4 w-4 pb-0.5" />
			</div>
		</div>
		<p class=" text-sm text-base-content/70"></p>
		<div class="flex flex-col gap-2">
			{#each edge.transitions as transition}
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
	{#if !edge.isLoopback}
		<hr class="border-base-content/70" />
		<label for="forceStraight" class="flex items-center justify-between gap-2">
			Force Straight
			<input
				id="forceStraight"
				type="checkbox"
				class="checkbox checkbox-sm checkbox-success"
				onchange={toggleForceStraight}
				checked={edge.forceStraight}
			/>
		</label>
		<label for="forceAlignCenter" class="flex items-center justify-between gap-2">
			Force Align To Center
			<input
				id="forceAlignCenter"
				type="checkbox"
				class="checkbox checkbox-sm checkbox-success"
				onchange={toggleForceAlignCenter}
				checked={edge.forceAlignCenter}
			/>
		</label>
	{/if}
</div>
