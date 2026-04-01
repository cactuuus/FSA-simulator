<script lang="ts">
	import { MANUAL_SECTIONS } from '$lib/utils/manual';
</script>

<section id={MANUAL_SECTIONS.INTRODUCTION.id} data-section class="section-header">
	<h2>{MANUAL_SECTIONS.INTRODUCTION.title}</h2>
</section>

<!-- What is an FSA? -->
<section id={MANUAL_SECTIONS.WHAT_IS_AN_FSA.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.WHAT_IS_AN_FSA.title}</h3>
	<p class="text-normal bottom-spaced">
		A <strong>Finite State Automaton</strong> (FSA) (also called a <em>Finite State Machine</em>) is
		a mathematical model of computation. It reads an input string one symbol at a time and decides,
		at the end, whether to <strong>accept</strong> or <strong>reject</strong> it. FSAs are commonly used
		in computer science to represent and manipulate regular languages, and they have applications in areas
		like text processing, compiler design, and digital circuit design.
	</p>
	<p class="text-normal bottom-spaced">
		Formally, an FSA is defined as a 5-tuple <strong>(Q, Σ, δ, q₀, F)</strong>:
	</p>
	<ul class="formal-definition-list">
		<li>
			<p class="text-normal bottom-spaced">
				<span class="term"> Q </span> — A finite, non-empty set of states.
			</p>
		</li>
		<li>
			<p class="text-normal bottom-spaced">
				<span class="term"> Σ </span>
				— The input alphabet, which is a finite set of symbols the machine can read.
			</p>
		</li>
		<li>
			<p class="text-normal bottom-spaced">
				<span class="term"> δ: Q × Σ → Q </span>
				— The transition function. It defines how the machine moves between states given a current state
				and an input symbol.
			</p>
		</li>
		<li>
			<p class="text-normal bottom-spaced">
				<span class="term"> q<sub>0</sub> ∈ Q </span>
				— The start state, where the machine begins before reading any input.
			</p>
		</li>
		<li>
			<p class="text-normal bottom-spaced">
				<span class="term"> F ⊆ Q </span>
				— The set of accepting states. If the machine halts in one of these states after processing the
				input, then the input is accepted, otherwise it is rejected.
			</p>
		</li>
	</ul>
</section>

<!-- Types of automata -->
<section id={MANUAL_SECTIONS.TYPES_OF_AUTOMATA.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.TYPES_OF_AUTOMATA.title}</h3>
	<p class="text-normal bottom-spaced">
		This application supports four types of automata. They differ in how transitions work and what
		kind of memory the machine has access to.
	</p>
	<ul class="panel-list">
		<li>
			<div class="item-header">
				<span class="badge font-bold badge-info">DFA</span>
				<span class="text-subtle">— Deterministic Finite Automaton</span>
			</div>
			<p class="text-normal">
				The simplest and most constrained type. From any state, each input symbol leads to at most
				one next state. DFAs are straightforward to simulate and minimise, and every NFA can be
				converted to an equivalent DFA.
				<br />
				<strong>Note:</strong> the formal definition of a DFA requires that every state has exactly one
				transition for every symbol in the alphabet (this is the definition of a "complete" DFA). However,
				in practice we often allow incomplete DFAs where missing transitions implicitly reject the input.
				This application uses the latter, more flexible definition.
			</p>
		</li>
		<li>
			<div class="item-header">
				<span class="badge font-bold badge-warning">NFA</span>
				<span class="text-subtle">— Non-deterministic Finite Automaton</span>
			</div>
			<p class="text-normal">
				Like a DFA, but from any state a symbol may lead to zero, one, or many next states
				simultaneously. NFAs also allow ε-transitions (epsilon-transitions, which change state
				without consuming any input). Despite the added freedom, NFAs and DFAs recognise exactly the
				same class of language (regular expressions), and can be converted to each other.
			</p>
		</li>
		<li>
			<div class="item-header">
				<span class="badge font-bold badge-success">PDA</span>
				<span class="text-subtle">— Push-down Automaton</span>
			</div>
			<p class="text-normal">
				An NFA extended with an infinite stack. Each transition can push or pop symbols from the
				stack, giving the machine a form of unbounded memory. This extension allows PDAs to
				recognize context-free languages, a strictly larger class than the regular languages.
				<br />
				In this application, we write PDA transitions in the from (<em>input, pop → push</em>).
			</p>
		</li>
		<li>
			<div class="item-header">
				<span class="badge font-bold badge-error">DPDA</span>
				<span class="text-subtle">— Deterministic Push-down Automaton</span>
			</div>
			<p class="text-normal">
				A deterministic variant of the PDA, meaning that for each state and input symbol, there is
				at most one possible next state. DPDAs are strictly less powerful than general PDAs, as
				there exist context-free languages that no DPDA can recognise.
			</p>
		</li>
	</ul>
</section>
