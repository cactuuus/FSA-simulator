<script lang="ts">
	import { TransitionSymbol, type Edge, FSAGraph } from '$lib/automata/models';
	import { X, Plus } from '@lucide/svelte';

	const { edge, fsaGraph }: { edge: Edge; fsaGraph: FSAGraph } = $props();
	const canDeleteTransition = $derived(edge.transitionSymbols.length > 1);
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h2>Symbols</h2>
			<button class="btn btn-sm btn-warning" onclick={() => fsaGraph.togglePDA(!fsaGraph.isPDA)}>
				{fsaGraph.isPDA ? 'Disable PDA Mode' : 'Enable PDA Mode'}
			</button>
		</div>
		<p class=" text-sm text-base-content/70"></p>
		<div class="flex max-h-120 flex-col gap-2 overflow-y-auto">
			{#each edge.transitionSymbols as symbol, index}
				<fieldset class="fieldset flex items-end gap-2 rounded-box bg-base-300 p-2">
					<legend class="fieldset-legend w-full py-0">
						<span class="badge border-0 bg-base-300 badge-sm">
							{symbol.toString()}
						</span>
						<button
							class="btn float-right btn-xs btn-error"
							onclick={() => edge.removeTransition(index)}
							title="Remove this transition symbol"
							disabled={!canDeleteTransition}
						>
							<X class="h-4 w-4" /> Remove
						</button>
					</legend>
					<label for="consume-{index}" class="flex-1">
						Consume
						<input
							id="consume-{index}"
							type="text"
							class="input-bordered input mt-1 w-full"
							bind:value={symbol.consumeRawValue}
							placeholder={TransitionSymbol.EPSILON}
						/>
					</label>
					{#if fsaGraph.isPDA}
						<label for="pop-{index}" class="flex-1">
							Pop (PDA)
							<input
								id="pop-{index}"
								type="text"
								class="input-bordered input mt-1 w-full"
								bind:value={symbol.popRawValue}
								placeholder={TransitionSymbol.EPSILON}
							/>
						</label>
						<label for="push-{index}" class="flex-1">
							Push (PDA)
							<input
								id="push-{index}"
								type="text"
								class="input-bordered input mt-1 w-full"
								bind:value={symbol.pushRawValue}
								placeholder={TransitionSymbol.EPSILON}
							/>
						</label>
					{/if}
				</fieldset>
			{/each}
		</div>
	</div>
	<button class="btn btn-sm btn-success" onclick={() => edge.addTransition(fsaGraph.isPDA)}>
		<Plus class="h-4 w-4" /> Add Symbol
	</button>
	{#if !edge.isLoopback()}
		<hr class="border-base-content/70" />
		<label for="forceStraight" class="flex items-center justify-between gap-2">
			Force Straight
			<input
				id="forceStraight"
				type="checkbox"
				class="checkbox checkbox-sm checkbox-success"
				bind:checked={edge.forceStraight}
			/>
		</label>
		<label for="forceAlignCenter" class="flex items-center justify-between gap-2">
			Force Align To Center
			<input
				id="forceAlignCenter"
				type="checkbox"
				class="checkbox checkbox-sm checkbox-success"
				bind:checked={edge.forceAlignCenter}
			/>
		</label>
	{/if}
</div>
