import { describe, it, expect } from 'vitest';
import { Transition } from '$lib/automata-models';
import { withReactivity } from '../helpers.svelte';

// --- Display values

describe('Transition - default/empty values', () => {
	it('empty consume returns epsilon', () => {
		withReactivity(() => {
			const t = Transition.createEmpty(false);
			expect(t.consume).toBe(Transition.EPSILON);
		});
	});

	it('empty pop and push returns epsilon when stack ops are enabled', () => {
		withReactivity(() => {
			const t = Transition.createEmpty(true);
			expect(t.pop).toBe(Transition.EPSILON);
			expect(t.push).toBe(Transition.EPSILON);
		});
	});

	it('pop and push return null when stack ops are disabled', () => {
		withReactivity(() => {
			const t = Transition.createEmpty(false);
			expect(t.pop).toBe(null);
			expect(t.push).toBe(null);
		});
	});
});

// --- Set/get values (consume, pop, push)

describe('Transition - set/get values', () => {
	it('consume can be set and retrieved', () => {
		withReactivity(() => {
			const value = 'a';
			const t = Transition.createEmpty(false);
			t.consumeRawValue = value;
			expect(t.consumeRawValue).toBe(value);
			expect(t.consume).toBe(value);
		});
	});

	it('pop can be set and retrieved', () => {
		withReactivity(() => {
			const value = 'x';
			const t = Transition.createEmpty(true);
			t.popRawValue = value;
			expect(t.popRawValue).toBe(value);
			expect(t.pop).toBe(value);
		});
	});

	it('push can be set and retrieved', () => {
		withReactivity(() => {
			const value = 'y';
			const t = Transition.createEmpty(true);
			t.pushRawValue = value;
			expect(t.pushRawValue).toBe(value);
			expect(t.push).toBe(value);
		});
	});
});

// --- Stack operations

describe('Transition - stack operations', () => {
	it('toggleStackOps(true) enables stack ops', () => {
		withReactivity(() => {
			const t = Transition.createEmpty(false);
			t.toggleStackOps(true);
			expect(t.hasStackOps()).toBe(true);
			expect(t.pop).toBe(Transition.EPSILON);
			expect(t.push).toBe(Transition.EPSILON);
		});
	});

	it('toggleStackOps(false) disables stack ops', () => {
		withReactivity(() => {
			const t = Transition.createEmpty(true);
			t.toggleStackOps(false);
			expect(t.hasStackOps()).toBe(false);
			expect(t.pop).toBe(null);
			expect(t.push).toBe(null);
		});
	});

	it('toggling off then on resets pop and push to epsilon', () => {
		withReactivity(() => {
			const t = Transition.createEmpty(true);
			t.popRawValue = 'x';
			t.pushRawValue = 'y';
			t.toggleStackOps(false);
			t.toggleStackOps(true);
			expect(t.pop).toBe(Transition.EPSILON);
			expect(t.push).toBe(Transition.EPSILON);
		});
	});
});

// --- toString

describe('Transition - toString', () => {
	it('FSA transition shows only the consume symbol', () => {
		withReactivity(() => {
			const value = 'a';
			const t = Transition.createEmpty(false);
			t.consumeRawValue = value;
			expect(t.toString()).toBe(value);
		});
	});

	it('FSA transition with empty consume shows epsilon', () => {
		withReactivity(() => {
			const t = Transition.createEmpty(false);
			expect(t.toString()).toBe(Transition.EPSILON);
		});
	});

	it('PDA transition shows consume, pop and push', () => {
		withReactivity(() => {
			const consume = 'a';
			const pop = 'x';
			const push = 'y';
			const t = new Transition(consume, pop, push);
			expect(t.toString()).toBe(`${consume}, ${pop} ⟶ ${push}`);
		});
	});

	it('PDA transition with empty symbols shows epsilon in all positions', () => {
		withReactivity(() => {
			const t = Transition.createEmpty(true);
			expect(t.toString()).toBe(
				`${Transition.EPSILON}, ${Transition.EPSILON} ⟶ ${Transition.EPSILON}`
			);
		});
	});
});

// --- Serialization

describe('Transition - serialization', () => {
	it('save/restore an FSA transition correctly', () => {
		withReactivity(() => {
			const id = 'test-id';
			const consume = 'a';
			const t = new Transition(consume, null, null, id);
			const restored = Transition.fromJSON(t.toJSON());
			expect(restored.id).toBe(id);
			expect(restored.consume).toBe(consume);
			expect(restored.pop).toBe(null);
			expect(restored.push).toBe(null);
		});
	});

	it('save/restore a PDA transition correctly', () => {
		withReactivity(() => {
			const id = 'test-id';
			const consume = 'a';
			const pop = 'x';
			const push = 'y';
			const t = new Transition(consume, pop, push, id);
			const restored = Transition.fromJSON(t.toJSON());
			expect(restored.id).toBe(id);
			expect(restored.consume).toBe(consume);
			expect(restored.pop).toBe(pop);
			expect(restored.push).toBe(push);
		});
	});

	it('save/restore an empty PDA transition (all epsilon) correctly', () => {
		withReactivity(() => {
			const id = 'test-id';
			const t = Transition.createEmpty(true, id);
			const restored = Transition.fromJSON(t.toJSON());
			expect(restored.hasStackOps()).toBe(true);
			expect(restored.consume).toBe(Transition.EPSILON);
			expect(restored.pop).toBe(Transition.EPSILON);
			expect(restored.push).toBe(Transition.EPSILON);
		});
	});
});
