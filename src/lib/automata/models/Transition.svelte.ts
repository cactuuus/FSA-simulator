import type { Serializable } from '$lib/utils/serialization';

/**
 * Serialized representation of a TransitionSymbol.
 * This can be a simple consume symbol, or include stack operations for PDAs.
 */
export interface SerializedTransition {
	id: string;
	consume: string;
	pop: string | null;
	push: string | null;
}

/**
 * Defines the transition symbol for an edge in the FSA. It includes the input symbol to consume,
 * as well as optional stack operations (pop and push) for PDAs.
 */
export class Transition implements Serializable<SerializedTransition> {
	static readonly EMPTY = ''; // used for internal/raw representation of empty symbols
	static readonly DISABLED = null; // used to indicate disabled operations (stack only)
	static readonly EPSILON = 'ε'; // user-facing representation of empty symbols

	readonly id: string;
	private _consume = $state<string>(Transition.EMPTY);
	private _pop = $state<string | null>(Transition.DISABLED);
	private _push = $state<string | null>(Transition.DISABLED);

	constructor(
		consume: string = '',
		pop: string | null = null,
		push: string | null = null,
		id?: string
	) {
		this.id = id ?? `t-${crypto.randomUUID()}`;
		this._consume = consume;
		this._pop = pop;
		this._push = push;
	}

	/**
	 * Shortand method to create an empty transition symbol, with or without stack operations.
	 * @param withStackOps Whether to include stack operations (pop and push) in the transition symbol.
	 * @returns A new TransitionSymbol instance.
	 */
	static createEmpty(withStackOps: boolean): Transition {
		if (withStackOps) {
			return new Transition(Transition.EMPTY, Transition.EMPTY, Transition.EMPTY);
		} else {
			return new Transition(Transition.EMPTY, Transition.DISABLED, Transition.DISABLED);
		}
	}

	get consume(): string {
		return this._consume === Transition.EMPTY ? Transition.EPSILON : this._consume;
	}

	get pop(): string | null {
		return this._pop === Transition.EMPTY ? Transition.EPSILON : this._pop;
	}

	get push(): string | null {
		return this._push === Transition.EMPTY ? Transition.EPSILON : this._push;
	}

	/**
	 * **Do not use these directly unless you have a specific reason.**
	 *
	 * The raw values of the consume symbol, which may be an empty string (or null for stack operations).
	 * Useful for input fields, allowing the user to fully clear the field. If not, the user would be fighting against the default epsilon value, unable to nicely delete if before setting a new value.
	 */

	get consumeRawValue(): string {
		return this._consume;
	}

	set consumeRawValue(newConsume: string) {
		this._consume = newConsume;
	}

	get popRawValue(): string | null {
		return this._pop;
	}

	set popRawValue(newPop: string | null) {
		this._pop = newPop;
	}

	get pushRawValue(): string | null {
		return this._push;
	}

	set pushRawValue(newPush: string | null) {
		this._push = newPush;
	}

	/**
	 * Toggles stack operations for this transition symbol.
	 * @param value True to enable stack operations, false to disable.
	 */
	toggleStackOps(value: boolean): void {
		if (!value) {
			this._pop = Transition.DISABLED;
			this._push = Transition.DISABLED;
		} else {
			this._pop = Transition.EMPTY;
			this._push = Transition.EMPTY;
		}
	}

	/**
	 * Checks if stack operations are enabled for this transition. It checks both, although they should be in sync, so there should be no case where one is enabled and the other is not.
	 * @returns True if both pop and push operations are enabled, false otherwise.
	 */
	hasStackOps(): boolean {
		return this._pop !== Transition.DISABLED && this._push !== Transition.DISABLED;
	}

	/**
	 * Returns a string representation of the transition symbol.
	 * For PDAs, it includes stack operations in the format: "consume, pop ⟶ push".
	 * For FSAs, it simply returns the consume symbol.
	 * @returns A string representing the transition symbol.
	 */
	toString(): string {
		if (this.hasStackOps()) {
			return `${this.consume}, ${this.pop} ⟶ ${this.push}`;
		}
		return `${this.consume}`;
	}

	toJSON(): SerializedTransition {
		return {
			id: this.id,
			consume: this._consume,
			pop: this._pop,
			push: this._push
		};
	}

	static fromJSON(json: SerializedTransition): Transition {
		return new Transition(json.consume, json.pop, json.push, json.id);
	}
}
