<script lang="ts">
	import { X, Plus, Trash2, TextInitial } from '@lucide/svelte';
	import { Transition } from '$lib/automata-models';
	import { portal } from '$lib/utils/portal';

	const {
		desired = $bindable(),
		actual,
		type
	}: { desired: Set<string>; actual: Set<string>; type: string } = $props();
	let modal: HTMLDialogElement;
	let newSymbol: string = $state('');
	const sortedDesired: string[] = $derived(Array.from(desired).sort());
	const isDuplicate: boolean = $derived(desired.has(newSymbol.trim() || Transition.EPSILON));
	const hasDesiredSymbols: boolean = $derived(desired.size > 0);
	const title: string = $derived(`Desired ${type} alphabet`);

	/**
	 * Opens the desired alphabet modal.
	 */
	function openModal() {
		modal?.showModal();
	}

	/**
	 * Closes the desired alphabet modal and resets the new symbol input.
	 */
	function closeModal() {
		modal?.close();
		newSymbol = '';
	}

	/**
	 * Adds a new symbol to the desired alphabet set.
	 */
	function addSymbol() {
		const symbol = newSymbol.trim() || Transition.EPSILON;
		desired.add(symbol);
		newSymbol = '';
	}

	/**
	 * Removes a symbol from the desired alphabet set.
	 * @param symbol The symbol to remove.
	 */
	function removeSymbol(symbol: string) {
		desired.delete(symbol);
	}

	/**
	 * Simple handler to allow the user to just press 'Enter' to add the new symbol, purely to improve UX.
	 * @param e The keyboard event.
	 */
	function handleNewInput(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addSymbol();
		}
	}
</script>

<div class="my-2 flex flex-col">
	<button
		class="flex cursor-pointer items-center gap-1 hover:text-secondary"
		onclick={openModal}
		title="Allows you to specify symbols that you'd want to be part of your FSA's {type} alphabet. This is purely for visual guidance and does not affect the FSA behavior."
	>
		<TextInitial class="h-4 w-4" />
		<span class="line-clamp-1 truncate overflow-hidden font-bold">{title}</span>
		{#if hasDesiredSymbols}
			<span class="opacity-70">[{desired.size} symbols]</span>
		{:else}
			<span class="opacity-70">[empty]</span>
		{/if}
	</button>
	<div class="inline-flex flex-wrap gap-1 py-1">
		{#if hasDesiredSymbols}
			{#each sortedDesired as symbol, index (index)}
				{#if actual.has(symbol)}
					<div
						class="badge cursor-help badge-soft font-mono badge-sm font-bold badge-success"
						title="This symbol is part of the FSA's {type} alphabet."
					>
						{symbol}
					</div>
				{:else}
					<div
						class="badge cursor-help badge-soft font-mono badge-sm font-bold badge-error"
						title="This symbol is missing from the FSA's {type} alphabet."
					>
						{symbol}
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<dialog bind:this={modal} class="modal" id="alphabet-override-modal" use:portal>
	<div class="modal-box w-11/12 max-w-sm">
		<h3 class="text-lg font-bold">{title}</h3>
		<p class="py-2 text-sm text-base-content/70">
			Define custom symbols for the alphabet. Leave empty for epsilon (ε).
		</p>

		<div class="modal-action mt-4 flex flex-col">
			<div class="flex gap-2">
				<input
					id="alphabet-override-input"
					type="text"
					class="input flex-1"
					bind:value={newSymbol}
					placeholder={Transition.EPSILON}
					autocomplete="off"
					onkeydown={handleNewInput}
				/>
				<button class="btn btn-sm btn-success" onclick={addSymbol}>
					<Plus class="h-4 w-4" />
					Add
				</button>
			</div>

			<!-- Warning message if the symbol is already in the desired list -->
			{#if isDuplicate}
				<p class="rounded-box bg-warning/20 px-2 py-1 text-sm text-warning">
					This symbol is already in the override list.
				</p>
			{/if}

			<div class="flex flex-wrap gap-2">
				{#if hasDesiredSymbols}
					{#each sortedDesired as symbol, index (index)}
						<div class="badge gap-2 badge-soft font-mono badge-sm font-bold">
							<span>{symbol}</span>
							<button class="cursor-pointer text-error" onclick={() => removeSymbol(symbol)}>
								<X class="h-3 w-3" />
							</button>
						</div>
					{/each}
				{:else}
					<p class="text-sm text-base-content/50 italic">No symbols added yet</p>
				{/if}
			</div>

			<div class="mt-2 flex justify-end">
				<button
					class="btn mr-auto btn-outline btn-error"
					onclick={() => desired.clear()}
					disabled={!hasDesiredSymbols}
				>
					<Trash2 class="h-4 w-4" />
					Clear
				</button>
				<button class="btn" onclick={closeModal}>Done</button>
			</div>
		</div>
	</div>
</dialog>
