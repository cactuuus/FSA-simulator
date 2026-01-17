import type { Serializable } from '$lib/utils/serialization';

/**
 * Serialized representation of a TransitionSymbol.
 */
export interface SerializedTransitionSymbol {
	consume: string;
	pop: string;
	push: string;
}

/**
 * Defines the transition symbol for an edge in the FSA. It includes the input symbol to consume,
 * as well as optional stack operations (pop and push) for PDAs.
 */
export class TransitionSymbol implements Serializable<SerializedTransitionSymbol> {
	static readonly EPSILON = 'ε';

	consume = $state<string>(TransitionSymbol.EPSILON);
	pop = $state<string>('');
	push = $state<string>('');

	constructor(consume: string, push: string = '', pop: string = '') {
		this.consume = consume;
		this.push = push;
		this.pop = pop;
	}

	/**
	 * **PDA only**:
	 * Checks if the transition symbol includes a pop operation.
	 * @returns True if there is a pop operation, false otherwise.
	 */
	hasPop(): boolean {
		return this.pop !== '';
	}

	/**
	 * **PDA only**:
	 * Checks if the transition symbol includes a push operation.
	 * @returns True if there is a push operation, false otherwise.
	 */
	hasPush(): boolean {
		return this.push !== '';
	}

	/**
	 * **PDA only**:
	 * Checks if the transition symbol requires any stack operation (push or pop).
	 * @returns True if there is a push or pop operation, false otherwise.
	 */
	requiresStackOp(): boolean {
		return this.hasPop() || this.hasPush();
	}

	/**
	 * Returns a string representation of the transition symbol.
	 * For PDAs, it includes stack operations in the format: "consume, pop ⟶ push".
	 * For FSAs, it simply returns the consume symbol.
	 * @returns A string representing the transition symbol.
	 */
	toString(): string {
		if (this.requiresStackOp()) {
			const popOperation = this.hasPop() ? this.pop : '?';
			const pushOperation = this.hasPush() ? this.push : '?';
			return `${this.consume}, ${popOperation} ⟶ ${pushOperation}`;
		}
		return `${this.consume}`;
	}

	toJSON(): SerializedTransitionSymbol {
		return {
			consume: this.consume,
			pop: this.pop,
			push: this.push
		};
	}

	static fromJSON(json: SerializedTransitionSymbol): TransitionSymbol {
		return new TransitionSymbol(json.consume, json.push, json.pop);
	}
}
