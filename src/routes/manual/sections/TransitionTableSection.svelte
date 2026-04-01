<script lang="ts">
	import { MANUAL_SECTIONS } from '$lib/utils/manual';
</script>

<section id={MANUAL_SECTIONS.TRANSITION_TABLE.id} data-section class="section-header">
	<h2>{MANUAL_SECTIONS.TRANSITION_TABLE.title}</h2>
</section>

<!-- Description -->
<section id={MANUAL_SECTIONS.TRANSITION_TABLE_DESCRIPTION.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.TRANSITION_TABLE_DESCRIPTION.title}</h3>
	<p class="text-normal">
		A <strong>transition table</strong> is a tabular representation of the transitions in an FSA.
		<br />
		Each row of the table represents a state, while each column corresponds to an input symbol (and top
		of the stack, for pushdown automata). The cell at the intersection of a row and column lists the target
		states for the transition defined by that state and input symbol.
		<br />
		For <strong>non-deterministic</strong> automata, if multiple states can be reached by consuming the
		same input symbol, they are all listed in the cell, separated by commas.
	</p>
</section>

<!-- Examples -->
<section id={MANUAL_SECTIONS.TRANSITION_TABLE_HOW_TO_READ.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.TRANSITION_TABLE_HOW_TO_READ.title}</h3>
	<figure>
		<img
			src="/manual/transition-table-example.avif"
			alt="Screenshot of a transition table for a non-pushdown automaton"
			loading="lazy"
		/>
		<figcaption>
			This can be read as: from state <strong>4</strong>, on input <strong>c</strong>, we transition
			to state <strong>2</strong>
		</figcaption>
	</figure>
	<figure>
		<img
			src="/manual/transition-table-pushdown-example.avif"
			alt="Screenshot of a transition table for a pushdown automaton"
			loading="lazy"
		/>
		<figcaption>
			This can be read as: from state <strong>q1</strong>, on input <strong>1</strong> and popping
			<strong>ε</strong> (aka without needing to pop anything), we push <strong>1</strong> and
			transition to state <strong>q1</strong>
		</figcaption>
	</figure>
</section>

<!-- Desired Alphabet -->
<section id={MANUAL_SECTIONS.TRANSITION_TABLE_DESIRED_ALPHABET.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.TRANSITION_TABLE_DESIRED_ALPHABET.title}</h3>
	<p class="text-normal">
		You can specify a <strong>desired alphabet</strong> for your automaton (for pushdown automata,
		you can also specify a <strong>desired stack alphabet</strong>). This represents the intended
		set of input symbols that the automaton should be able to process.
	</p>
	<img
		src="/manual/transition-table-desired-alphabet.avif"
		alt="Screenshot of a transition table with a warning about missing symbols in the alphabet"
		loading="lazy"
		class="aspect-auto!"
	/>
	<p class="text-normal">
		As shown in the image above, once you define a desired alphabet, symbols that are already
		predent in the actual alphabet will be highlighted in green, while missing symbols will be
		highlighted in red.
		<br />
		This feature is purely for visual guidance when building your automaton, and it does not affect its
		actual behavior in any way.
	</p>
</section>
