<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { InputSymbol, getTransitionTable } from '$lib/automata/analisys/transitionTable';
	import { FSAGraph, Node, Transition } from '$lib/automata/models';

	const { fsaGraph }: { fsaGraph: FSAGraph } = $props();
	let graphElement = $state<HTMLElement | null>(null);
	let editModal: HTMLDialogElement;
	let modalContext = $state<{
		type: 'consume' | 'pop';
		transitions: Transition[];
		originalValue: string;
	} | null>(null);
	let editModalValue = $state<string>('');

	$effect(() => {
		graphElement = document.getElementById('fsa-graph');
	});

	/**
	 * Groups consume input symbols, in order to display them in a single cell spanning multiple columns.
	 * This really only matters when handling PDAs, where multiple columns can share the same consume symbol but have different pop operations.
	 * @param inputs The list of input symbols to group.
	 * @returns The grouped comsume (only) input symbols with their respective span and list of transitions.
	 */
	function groupComputeInputs(
		inputs: InputSymbol[]
	): { symbol: string; span: number; transitions: Set<Transition> }[] {
		const groups: { symbol: string; span: number; transitions: Set<Transition> }[] = [];
		inputs.forEach((input) => {
			const lastGroup = groups.at(-1);
			if (lastGroup?.symbol === input.consume) {
				lastGroup.span++;
				input.transitions.forEach((t) => lastGroup.transitions.add(t));
			} else {
				groups.push({
					symbol: input.consume,
					span: 1,
					transitions: new Set(input.transitions)
				});
			}
		});
		return groups;
	}

	/**
	 * Generates a map of nodes to unique labels, appending '#' to duplicate labels.
	 * @param nodes The list of nodes to generate labels for.
	 * @returns A map from each node to its unique label.
	 */
	function generateUniqueLabelsMap(nodes: Node[]): Map<Node, string> {
		const taken = new Set<string>();
		const nodeToLabel = new Map<Node, string>();
		nodes.forEach((node) => {
			let label = node.label;
			while (taken.has(label)) {
				label = `${label}#`;
			}
			taken.add(label);
			nodeToLabel.set(node, label);
		});
		return nodeToLabel;
	}

	/**
	 * Toggles the 'highlighted' class on one or more elements in the graph by their data-ids.
	 * @param state Whether to add or remove the highlight.
	 * @param ids The ids of the elements to toggle highlight on.
	 */
	function toggleHighlight(state: boolean, ...ids: string[]): void {
		ids.forEach((id) => {
			const element = graphElement?.querySelector(`[data-id="${id}"]`);
			element?.classList.toggle('highlighted', state);
		});
	}

	/**
	 * Opens the edit modal for a specific group of transitions. The type denote if the consume or pop symbol is being edited.
	 * @param type The type of symbol to edit ('consume' or 'pop').
	 * @param transitions The list of transitions that will be edited.
	 */
	function openEditModal(type: 'consume' | 'pop', transitions: Transition[]): void {
		let originalValue: string;
		if (type === 'consume') {
			originalValue = transitions[0].consumeRawValue;
		} else if (type === 'pop') {
			originalValue = transitions[0].popRawValue || '';
		} else {
			throw new Error(`Unknown symbol type: ${type}`);
		}
		modalContext = { type, transitions, originalValue };
		editModalValue = originalValue;
		editModal.showModal();
	}

	/**
	 * Updates the transitions with the new value from the modal.
	 * @param e The submit event.
	 */
	function saveEdit(e: SubmitEvent): void {
		e.preventDefault();
		if (!modalContext) return;
		if (editModalValue === modalContext.originalValue) {
			closeModal();
			return;
		}
		modalContext.transitions.forEach((transition) => {
			if (modalContext!.type === 'consume') {
				transition.consumeRawValue = editModalValue;
			} else if (modalContext!.type === 'pop') {
				transition.popRawValue = editModalValue;
			} else {
				throw new Error(`Unknown symbol type: ${modalContext!.type}`);
			}
		});
		closeModal();
	}

	/**
	 * Closes the edit modal and resets its context.
	 */
	function closeModal(): void {
		modalContext = null;
		editModal.close();
	}

	/**
	 * Deletes the transitions currently in the modal context, then closes the modal.
	 */
	function deleteFromModal(): void {
		if (!modalContext) return;
		modalContext.transitions.forEach((transition) => {
			fsaGraph.deleteTransition(transition);
		});
		closeModal();
	}
</script>

{#if fsaGraph.edges.length === 0}
	<p class="mt-4 rounded-box bg-base-300 p-4 text-center text-base-content/70">
		Nothing to show!
		<br />
		The FSA has no transitions.
	</p>
{:else}
	{@const table = getTransitionTable(fsaGraph)}
	{@const uniqueLabels = generateUniqueLabelsMap(fsaGraph.nodes)}
	{@const PdaMode = fsaGraph.hasStackOps}
	<table id="transition-table" class="table table-zebra">
		<thead id="table-header">
			<!-- Row showing the consume input symbols -->
			<tr class="col-header">
				<th class="col-header-label v-borders h-borders" colspan="3">input</th>
				<td class="spacer v-borders h-borders"></td>
				{#each groupComputeInputs(table.inputs) as group}
					{@const transitionIds = Array.from(group.transitions).map((t) => t.id)}
					<th
						colspan={group.span}
						class="col-header-symbol v-borders h-borders relative cursor-pointer"
						title="Click to edit input symbol for these transitions"
						onmouseenter={() => toggleHighlight(true, ...transitionIds)}
						onmouseleave={() => toggleHighlight(false, ...transitionIds)}
						onclick={() => openEditModal('consume', Array.from(group.transitions))}
					>
						{group.symbol}
					</th>
				{/each}
			</tr>
			{#if PdaMode}
				<!-- Second row showing pop (top of stack) symbols -->
				<tr class="col-header">
					<th class="col-header-label v-borders h-borders" colspan="3">stack</th>
					<td class="spacer v-borders h-borders"></td>
					{#each table.inputs as input}
						{@const transitionIds = Array.from(input.transitions).map((t) => t.id)}
						<th
							class="col-header-symbol v-borders h-borders relative cursor-pointer"
							title="Click to edit stack symbol for these transitions"
							onmouseenter={() => toggleHighlight(true, ...transitionIds)}
							onmouseleave={() => toggleHighlight(false, ...transitionIds)}
							onclick={() => openEditModal('pop', Array.from(input.transitions))}
						>
							{input.pop!}
						</th>
					{/each}
				</tr>
			{/if}
			<tr><td colspan={table.inputs.length + 2} class="spacer invisible"></td></tr>
		</thead>

		<tbody class="content">
			{#each table.content as row, rowIndex}
				{@const node = fsaGraph.nodes[rowIndex]}
				<tr>
					{#if rowIndex === 0}
						<th class="row-header-label v-borders h-borders" rowspan={table.content.length}>
							<span class="states-label">states</span>
						</th>
						<td class="spacer" rowspan={table.content.length}></td>
					{/if}
					<th
						class="row-header-state h-borders v-borders whitespace-nowrap"
						data-node-id={node.id}
						onmouseenter={() => toggleHighlight(true, node.id)}
						onmouseleave={() => toggleHighlight(false, node.id)}
					>
						<!-- for the states, the label also indicates if it is starting and/or accepting -->
						{#if node.id === fsaGraph.startNode?.id}
							→
						{/if}
						{#if node.isAccepting}
							[{uniqueLabels.get(node)}]
						{:else}
							{uniqueLabels.get(node)}
						{/if}
					</th>
					<td class="spacer h-borders v-borders"></td>
					{#each row as cell}
						<td class="cell h-borders v-borders">
							{#if cell.length === 0}
								<!-- Empty cell -->
								&mdash;
							{:else}
								<ul class="transition-output-list">
									{#each cell as output}
										{@const stateLabel = uniqueLabels.get(output.targetState)!}
										<li
											class="transition-output-entry whitespace-nowrap"
											role="presentation"
											data-transition-id={output.transition.id}
											onmouseenter={() => toggleHighlight(true, output.transition.id)}
											onmouseleave={() => toggleHighlight(false, output.transition.id)}
										>
											{#if PdaMode}
												{`(${output.transition.push}, ${stateLabel})`}
											{:else}
												{`${stateLabel}`}
											{/if}
										</li>
									{/each}
								</ul>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<!-- Edit/delete modal -->
<dialog id="batch-edit-transition-modal" bind:this={editModal} class="modal">
	<div class="modal-box w-11/12 max-w-sm">
		<h3 class="text-lg font-bold">
			Edit {modalContext?.type === 'consume' ? 'input' : 'stack'} symbol
		</h3>
		<p class="py-2 text-sm text-base-content/70">
			This will update {modalContext?.transitions.length} transition(s)
		</p>
		<div class="modal-action mt-4">
			<form class="w-full" onsubmit={saveEdit}>
				<input
					id="batch-edit-transition-input"
					type="text"
					class="input w-full"
					bind:value={editModalValue}
					placeholder={Transition.EPSILON}
					autocomplete="off"
				/>
				<div class="mt-4 flex justify-between">
					<button type="button" class="btn btn-outline btn-error" onclick={deleteFromModal}>
						<Trash2 class="h-4 w-4" />
						Delete
					</button>
					<div class="flex gap-2">
						<button type="button" class="btn" onclick={closeModal}>Cancel</button>
						<button type="submit" class="btn btn-success">Save</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</dialog>
