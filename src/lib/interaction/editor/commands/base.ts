import type { FSAGraph } from '$lib/automata/models/FSAGraph.svelte';
import { type Serializable } from '$lib/utils/serialization';

/**
 * Serialized representation of a command.
 * @template T The type of the data contained in the command.
 */
export interface SerializedCommand<T = unknown> {
	id: string;
	data: T;
}

/**
 * Abstract base class for commands that can be executed and undone. Each command has a unique ID and associated data.
 */
export abstract class Command<T = unknown> implements Serializable<SerializedCommand<T>> {
	abstract readonly id: string;
	abstract readonly data: T;
	abstract execute(_fsa: FSAGraph): void;
	abstract undo(_fsa: FSAGraph): void;
	abstract toJSON(): SerializedCommand<T>;
}
