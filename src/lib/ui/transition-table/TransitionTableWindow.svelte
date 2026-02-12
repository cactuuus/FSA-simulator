<script lang="ts">
	import { CircleQuestionMark } from '@lucide/svelte';
	import { WINDOWS_ID } from '$lib/interaction/Windows.svelte';
	import { app } from '$lib/stores/app.svelte';
	import FloatingWindow from '$lib/ui/components/FloatingWindow.svelte';
	import TransitionTable from './TransitionTable.svelte';
	import DesiredAlphabet from './DesiredAlphabet.svelte';
</script>

<FloatingWindow
	id={WINDOWS_ID.TransitionTable}
	windowState={app.windows.open(WINDOWS_ID.TransitionTable)!}
	onClose={() => app.windows.close(WINDOWS_ID.TransitionTable)}
>
	{#snippet header()}
		<span>Transition Table</span>
	{/snippet}
	{#snippet content()}
		<div class="flex flex-col gap-2">
			<TransitionTable fsaGraph={app.fsaGraph} commandHistory={app.commandHistory} />
			<div>
				<DesiredAlphabet
					desired={app.desiredAlphabet.input}
					actual={app.fsaGraph.alphabet(true)}
					type="input"
				/>
				{#if app.fsaGraph.hasStackOps}
					<DesiredAlphabet
						desired={app.desiredAlphabet.stack}
						actual={app.fsaGraph.stackAlphabet(true)}
						type="stack"
					/>
				{/if}
			</div>
			<div class="collapse-arrow collapse">
				<label
					class="collapse-title flex items-center gap-2 p-0 font-semibold btn-link"
					for="transition-table-how-to-read"
				>
					<CircleQuestionMark class="h-4 w-4 cursor-help" />
					<span>How do I read this?</span>
				</label>
				<input
					type="checkbox"
					name="transition-table-how-to-read"
					id="transition-table-how-to-read"
				/>
				<div class="collapse-content text-sm text-base-content/70">
					<ol class="ml-6 list-outside list-decimal">
						<li>On the left are the states of the FSA.</li>
						<li>
							Each column represents an input symbol needed for the transition. For PDAs, these also
							include the symbol at the top of the stack.
						</li>
						<li>
							Each cell shows the states reachable from the source state (row) when the input symbol
							(column) is read, as a result of the transition.
						</li>
					</ol>
				</div>
			</div>
		</div>
	{/snippet}
</FloatingWindow>
