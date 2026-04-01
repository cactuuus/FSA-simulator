<script lang="ts">
	import { BookOpen } from '@lucide/svelte';
	import { WINDOWS_ID } from '$lib/windows/Windows.svelte';
	import { app } from '$lib/stores/app.svelte';
	import FloatingWindow from '$lib/windows/FloatingWindow.svelte';
	import TransitionTable from './TransitionTable.svelte';
	import DesiredAlphabet from './DesiredAlphabet.svelte';
	import { MANUAL_SECTIONS, manualHref } from '$lib/utils/manual';
</script>

<FloatingWindow
	id={WINDOWS_ID.TransitionTable}
	windowState={app.windows.open(WINDOWS_ID.TransitionTable)!}
	onClose={() => app.windows.close(WINDOWS_ID.TransitionTable)}
	onFocus={() => app.windows.bringToFront(WINDOWS_ID.TransitionTable)}
	defaultWidth={600}
>
	{#snippet header()}
		<span class="flex items-center gap-2">
			Transition Table
			<a
				href={manualHref(MANUAL_SECTIONS.TRANSITION_TABLE)}
				target="_blank"
				rel="noopener noreferrer"
				class="text-primary hover:text-secondary"
				title="Open manual section about transition tables"
			>
				<BookOpen class="h-4 w-4" />
			</a>
		</span>
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
					<hr class="my-2 border-base-content/30" />
					<DesiredAlphabet
						desired={app.desiredAlphabet.stack}
						actual={app.fsaGraph.stackAlphabet(true)}
						type="stack"
					/>
				{/if}
			</div>
		</div>
	{/snippet}
</FloatingWindow>
