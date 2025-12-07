import type { SerializedTransitionSymbol, Serializable } from '$lib/automata/serialisation';

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

	hasPop(): boolean {
		return this.pop !== '';
	}

	hasPush(): boolean {
		return this.push !== '';
	}

	requiresStackOp(): boolean {
		return this.hasPop() || this.hasPush();
	}

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
}
