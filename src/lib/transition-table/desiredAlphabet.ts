import type { Serializable } from '$lib/utils/serialization';
import { SvelteSet } from 'svelte/reactivity';

/**
 * Serialized representation of the desired alphabet for input and stack symbols in an automaton.
 */
export class SerializedDesiredAlphabet {
	input: string[] = [];
	stack: string[] = [];
}

/**
 * Represents the desired alphabet for input and stack symbols in an automaton.
 */
export class DesiredAlphabet implements Serializable<SerializedDesiredAlphabet> {
	readonly input: Set<string> = new SvelteSet();
	readonly stack: Set<string> = new SvelteSet();

	reset(): void {
		this.input.clear();
		this.stack.clear();
	}

	toJSON(): SerializedDesiredAlphabet {
		return {
			input: Array.from(this.input),
			stack: Array.from(this.stack)
		};
	}

	loadFromJSON(json: SerializedDesiredAlphabet): void {
		this.reset();
		json.input.forEach((symbol) => this.input.add(symbol));
		json.stack.forEach((symbol) => this.stack.add(symbol));
	}
}
