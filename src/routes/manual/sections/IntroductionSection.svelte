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
		at the end, whether to <strong>accept</strong> or <strong>reject</strong> it. If an input is
		accepted, we say that the automaton "recognises" it, and that the input belongs to the
		<strong>language</strong> recognised by the automaton (a simple example of a language could be
		the set of all inputs that start with <em>"a"</em>).
		<span class="my-2 alert block alert-soft p-2 alert-info">
			<strong>In other words:</strong> an FSA is a machine that takes a string as input and decides whether
			it belongs to a specific set of strings (the language).
		</span>
		Put simply, an FSA can be broken down into these five components:
	</p>
	<ul class="panel-list">
		<li>
			<div class="item-header font-bold">States</div>
			<div class="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
				<p class="text-normal">
					Each state represents a different configuration that the automaton can be in. In the
					grapical representation, these are represented as circles, with the name of the state
					written inside.
					<br />
					<strong>Note:</strong> there are special types of states covered later in the list:
					<em>start</em> and <em>accepting</em> states. A state could be start, accepting, both, or neither.
				</p>
				<img
					src="/manual/state.avif"
					alt="FSA state example"
					class="m-0! max-h-40 max-w-60!"
					loading="lazy"
				/>
			</div>
		</li>
		<li>
			<div class="item-header font-bold">Transitions</div>
			<div class="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
				<p class="text-normal">
					The rules that define how the machine moves between states. They are represented as arrows
					connecting states, where their labels indicate the input needed to perform the transition
					to the state they point to.
					<br />
					<strong>Note:</strong> a transition can also point to the same state it starts from, which
					is called a <em>loop transition</em>.
				</p>
				<img
					src="/manual/transition.avif"
					alt="FSA transition example"
					class="m-0! max-h-40 max-w-60!"
					loading="lazy"
				/>
			</div>
		</li>
		<li>
			<div class="item-header font-bold">Alphabet</div>
			<div class="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
				<p class="text-normal">
					The set of symbols that the machine can read as input. These are the same symbols used in
					the transitions' labels, therefore you can infer it from the transitions themselves, but
					it is often explicitly represented as a list of symbols for clarity.
				</p>
				<img
					src="/manual/alphabet.avif"
					alt="FSA alphabet example"
					class="m-0! max-h-40 max-w-60!"
					loading="lazy"
				/>
			</div>
		</li>
		<li>
			<div class="item-header font-bold">Start State</div>
			<div class="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
				<p class="text-normal">
					The initial state of the automaton, which is the configuration the machine is in before it
					starts processing any input. This is marked by an incoming unlabelled arrow with no
					origin.
				</p>
				<img
					src="/manual/start-state.avif"
					alt="FSA start state example"
					class="m-0! max-h-40 max-w-60!"
					loading="lazy"
				/>
			</div>
		</li>
		<li>
			<div class="item-header font-bold">Accepting States</div>
			<div class="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
				<p class="text-normal">
					A set of states in which the automaton, when done processing the given input, accepts it.
					These are represented as double circles.
				</p>
				<img
					src="/manual/accepting-state.avif"
					alt="FSA accepting state example"
					class="m-0! max-h-40 max-w-60!"
					loading="lazy"
				/>
			</div>
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
				The simplest and most constrained type. As the name suggests, they are <strong
					>deterministic</strong
				>, which means that from any state, each input symbol leads to at most one state.
				<br />
				This <em>deterministic</em> behaviour makes them easy to understand and reason about, but
				can result in more complex automata compared to their non-deterministic counterparts (for
				the same recognised language).
				<br />
				<br />
				<strong>Note:</strong> the formal definition of a DFA requires that every state has exactly
				one transition for every symbol in the alphabet (this is the definition of a
				<strong>complete</strong> DFA). However, in practice we often allow incomplete DFAs where missing
				transitions implicitly reject the input. This application uses the latter, more flexible definition.
			</p>
		</li>
		<li>
			<div class="item-header">
				<span class="badge font-bold badge-warning">NFA</span>
				<span class="text-subtle">— Non-deterministic Finite Automaton</span>
			</div>
			<p class="text-normal">
				Like a DFA, but from any state a symbol may lead to more than one state simultaneously. NFAs
				also allow <strong>ε-transitions</strong> (read as "epsilon-transitions"), which are special transitions
				that allow the automaton to change state without consuming any input. Despite the added freedom,
				NFAs and DFAs recognise exactly the same class of language (regular expressions), and can be converted
				to each other.
			</p>
		</li>
		<li>
			<div class="item-header">
				<span class="badge font-bold badge-success">PDA</span>
				<span class="text-subtle">— Push-down Automaton</span>
			</div>
			<p class="text-normal">
				An NFA extended with an infinite stack, allowing transitions to push or pop symbols from the
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
				A <em>deterministic</em> variant of the PDA, meaning that for each state, input symbol, and stack
				symbol to pop, there is at most one possible next state. DPDAs are strictly less powerful than
				general PDAs, as there exist context-free languages that no DPDA can recognise.
			</p>
		</li>
	</ul>
</section>
