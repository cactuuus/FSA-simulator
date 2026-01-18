import type { Serializable } from '$lib/utils/serialization';

/**
 * Serialized representation of a TransitionSymbol.
 * This can be a simple consume symbol, or include stack operations for PDAs.
 */
export interface SerializedTransitionSymbol {
	consume: string;
	pop: string | null;
	push: string | null;
}

/**
 * Defines the transition symbol for an edge in the FSA. It includes the input symbol to consume,
 * as well as optional stack operations (pop and push) for PDAs.
 */
export class TransitionSymbol implements Serializable<SerializedTransitionSymbol> {
	static readonly EMPTY = ''; // used for internal/raw representation of empty symbols
	static readonly DISABLED = null; // used to indicate disabled operations (stack only)
	static readonly EPSILON = 'ε'; // user-facing representation of empty symbols

	private _consume = $state<string>(TransitionSymbol.EMPTY);
	private _pop = $state<string | null>(TransitionSymbol.DISABLED);
	private _push = $state<string | null>(TransitionSymbol.DISABLED);

	constructor(consume: string = '', push: string | null = null, pop: string | null = null) {
		this._consume = consume;
		this._pop = pop;
		this._push = push;
	}

	/**
	 * Shortand method to create an empty transition symbol, with or without stack operations.
	 * @param withStackOps Whether to include stack operations (pop and push) in the transition symbol.
	 * @returns A new TransitionSymbol instance.
	 */
	static createEmpty(withStackOps: boolean): TransitionSymbol {
		if (withStackOps) {
			return new TransitionSymbol(
				TransitionSymbol.EMPTY,
				TransitionSymbol.EMPTY,
				TransitionSymbol.EMPTY
			);
		} else {
			return new TransitionSymbol(
				TransitionSymbol.EMPTY,
				TransitionSymbol.DISABLED,
				TransitionSymbol.DISABLED
			);
		}
	}

	get consume(): string {
		return this._consume === TransitionSymbol.EMPTY ? TransitionSymbol.EPSILON : this._consume;
	}

	get pop(): string | null {
		return this._pop === TransitionSymbol.EMPTY ? TransitionSymbol.EPSILON : this._pop;
	}

	get push(): string | null {
		return this._push === TransitionSymbol.EMPTY ? TransitionSymbol.EPSILON : this._push;
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
			this._pop = TransitionSymbol.DISABLED;
			this._push = TransitionSymbol.DISABLED;
		} else {
			this._pop = TransitionSymbol.EMPTY;
			this._push = TransitionSymbol.EMPTY;
		}
	}

	/**
	 * Checks if stack operations are enabled for this transition symbol. It checks both, although they should be in sync, so there should be no case where one is enabled and the other is not.
	 * @returns True if both pop and push operations are enabled, false otherwise.
	 */
	hasStackOps(): boolean {
		return this._pop !== TransitionSymbol.DISABLED && this._push !== TransitionSymbol.DISABLED;
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

	toJSON(): SerializedTransitionSymbol {
		return {
			consume: this._consume,
			pop: this._pop,
			push: this._push
		};
	}

	static fromJSON(json: SerializedTransitionSymbol): TransitionSymbol {
		return new TransitionSymbol(json.consume, json.pop, json.push);
	}
}
