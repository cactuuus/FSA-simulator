import { describe, it, expect } from 'vitest';
import { FSAGraph, Transition } from '$lib/automata-models';
import {
	AddNodeCommand,
	AddEdgeCommand,
	DeleteFSAItemsCommand,
	MoveNodesCommand,
	SetStartNodeCommand,
	ToggleNodeAcceptingCommand,
	UpdateNodeLabelCommand,
	AddTransitionCommand,
	DeleteTransitionsCommand,
	UpdateTransitionCommand,
	EnableStackOpsCommand,
	DisableStackOpsCommand,
	AdjustEdgeShapeCommand,
	ToggleEdgeSymmetricCommand
} from '$lib/editor/commands';
import { withReactivity } from '../helpers.svelte';

// --- Helpers

function makeFSA() {
	const fsa = new FSAGraph();
	const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
	const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
	const edge = fsa.createNewEdge(q0, q1);
	return { fsa, q0, q1, edge };
}

// --- AddNodeCommand

describe('AddNodeCommand', () => {
	it('execute adds a node, undo removes it', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const cmd = new AddNodeCommand({ x: 0, y: 0 });
			cmd.execute(fsa);
			expect(fsa.nodes).toHaveLength(1);
			cmd.undo(fsa);
			expect(fsa.nodes).toHaveLength(0);
		});
	});
});

// --- AddEdgeCommand

describe('AddEdgeCommand', () => {
	it('execute adds an edge, undo removes it', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			const cmd = new AddEdgeCommand(q0.id, q1.id);
			cmd.execute(fsa);
			expect(fsa.edges).toHaveLength(1);
			cmd.undo(fsa);
			expect(fsa.edges).toHaveLength(0);
		});
	});
});

// --- DeleteFSAItemsCommand

describe('DeleteFSAItemsCommand', () => {
	it('execute deletes nodes and connected edges, undo restores them', () => {
		withReactivity(() => {
			const { fsa, q0, q1 } = makeFSA();
			const cmd = new DeleteFSAItemsCommand(q0.id, q1.id);
			cmd.execute(fsa);
			expect(fsa.nodes).toHaveLength(0);
			expect(fsa.edges).toHaveLength(0);
			cmd.undo(fsa);
			expect(fsa.nodes).toHaveLength(2);
			expect(fsa.edges).toHaveLength(1);
		});
	});

	it('execute deletes a single edge, undo restores it', () => {
		withReactivity(() => {
			const { fsa, edge } = makeFSA();
			const cmd = new DeleteFSAItemsCommand(edge.id);
			cmd.execute(fsa);
			expect(fsa.edges).toHaveLength(0);
			cmd.undo(fsa);
			expect(fsa.edges).toHaveLength(1);
		});
	});

	it('undo restores the start node if it was deleted', () => {
		withReactivity(() => {
			const { fsa, q0 } = makeFSA();
			expect(fsa.startNode?.id).toBe(q0.id);
			const cmd = new DeleteFSAItemsCommand(q0.id);
			cmd.execute(fsa);
			expect(fsa.startNode).toBe(null);
			cmd.undo(fsa);
			expect(fsa.startNode?.id).toBe(q0.id);
		});
	});
});

// --- MoveNodesCommand

describe('MoveNodesCommand', () => {
	it('execute moves nodes by offset, undo moves them back', () => {
		withReactivity(() => {
			const { fsa, q0 } = makeFSA();
			const initialPos = { ...q0.pos };
			const offset = { x: 50, y: 30 };
			const cmd = new MoveNodesCommand(offset, q0.id);
			cmd.execute(fsa);
			expect(q0.pos.x).toBeCloseTo(initialPos.x + offset.x);
			expect(q0.pos.y).toBeCloseTo(initialPos.y + offset.y);
			cmd.undo(fsa);
			expect(q0.pos.x).toBeCloseTo(initialPos.x);
			expect(q0.pos.y).toBeCloseTo(initialPos.y);
		});
	});
});

// --- SetStartNodeCommand

describe('SetStartNodeCommand', () => {
	it('execute sets the start node, undo restores the previous one', () => {
		withReactivity(() => {
			const { fsa, q0, q1 } = makeFSA();
			expect(fsa.startNode?.id).toBe(q0.id);
			const cmd = new SetStartNodeCommand(q1.id);
			cmd.execute(fsa);
			expect(fsa.startNode?.id).toBe(q1.id);
			cmd.undo(fsa);
			expect(fsa.startNode?.id).toBe(q0.id);
		});
	});
});

// --- ToggleNodeAcceptingCommand

describe('ToggleNodeAcceptingCommand', () => {
	it('execute toggles accepting state, undo reverts it', () => {
		withReactivity(() => {
			const { fsa, q0 } = makeFSA();
			expect(q0.isAccepting).toBe(false);
			const cmd = new ToggleNodeAcceptingCommand(q0.id, true);
			cmd.execute(fsa);
			expect(q0.isAccepting).toBe(true);
			cmd.undo(fsa);
			expect(q0.isAccepting).toBe(false);
		});
	});
});

// --- UpdateNodeLabelCommand

describe('UpdateNodeLabelCommand', () => {
	it('execute updates label, undo restores it', () => {
		withReactivity(() => {
			const { fsa, q0 } = makeFSA();
			const cmd = new UpdateNodeLabelCommand(q0.id, q0.label, 'new-label');
			cmd.execute(fsa);
			expect(q0.label).toBe('new-label');
			cmd.undo(fsa);
			expect(q0.label).toBe('q0');
		});
	});
});

// --- AddTransitionCommand

describe('AddTransitionCommand', () => {
	it('execute adds a transition, undo removes it', () => {
		withReactivity(() => {
			const { fsa, edge } = makeFSA();
			const initialCount = edge.transitions.length;
			const cmd = new AddTransitionCommand(edge.id, false);
			cmd.execute(fsa);
			expect(edge.transitions).toHaveLength(initialCount + 1);
			cmd.undo(fsa);
			expect(edge.transitions).toHaveLength(initialCount);
		});
	});
});

// --- DeleteTransitionsCommand

describe('DeleteTransitionsCommand', () => {
	it('execute deletes a transition, undo restores it', () => {
		withReactivity(() => {
			const { fsa, edge } = makeFSA();
			const transitionId = edge.transitions[0].id;
			const cmd = new DeleteTransitionsCommand(transitionId);
			cmd.execute(fsa);
			expect(edge.transitions).toHaveLength(0);
			cmd.undo(fsa);
			expect(edge.transitions).toHaveLength(1);
		});
	});

	it('deleting all transitions from an edge also deletes the edge, undo restores both', () => {
		withReactivity(() => {
			const { fsa, edge } = makeFSA();
			const transitionId = edge.transitions[0].id;
			const cmd = new DeleteTransitionsCommand(transitionId);
			cmd.execute(fsa);
			expect(fsa.edges).toHaveLength(0);
			cmd.undo(fsa);
			expect(fsa.edges).toHaveLength(1);
			expect(fsa.edges[0].transitions).toHaveLength(1);
		});
	});
});

// --- UpdateTransitionCommand

describe('UpdateTransitionCommand', () => {
	it('execute updates transition values, undo restores them', () => {
		withReactivity(() => {
			const { fsa, edge } = makeFSA();
			const transition = edge.transitions[0];
			const cmd = new UpdateTransitionCommand({
				transitionId: transition.id,
				from: { rawConsume: '', rawPop: null, rawPush: null },
				to: { rawConsume: 'a', rawPop: null, rawPush: null }
			});
			cmd.execute(fsa);
			expect(transition.consume).toBe('a');
			cmd.undo(fsa);
			expect(transition.consume).toBe(Transition.EPSILON);
		});
	});
});

// --- AdjustEdgeShapeCommand

describe('AdjustEdgeShapeCommand', () => {
	it('execute updates control point, undo restores it', () => {
		withReactivity(() => {
			const { fsa, edge } = makeFSA();
			const initial = { ...edge.controlPoint };
			const final = { x: 60, y: 80 };
			const cmd = new AdjustEdgeShapeCommand(edge.id, initial, final);
			cmd.execute(fsa);
			expect(edge.controlPoint.x).toBeCloseTo(final.x);
			expect(edge.controlPoint.y).toBeCloseTo(final.y);
			cmd.undo(fsa);
			expect(edge.controlPoint.x).toBeCloseTo(initial.x);
			expect(edge.controlPoint.y).toBeCloseTo(initial.y);
		});
	});
});

// --- ToggleEdgeSymmetricCommand

describe('ToggleEdgeSymmetricCommand', () => {
	it('execute toggles isSymmetric, undo reverts it', () => {
		withReactivity(() => {
			const { fsa, edge } = makeFSA();
			expect(edge.isSymmetric).toBe(false);
			const cmd = new ToggleEdgeSymmetricCommand(edge.id, true);
			cmd.execute(fsa);
			expect(edge.isSymmetric).toBe(true);
			cmd.undo(fsa);
			expect(edge.isSymmetric).toBe(false);
		});
	});
});

// --- EnableStackOpsCommand

describe('EnableStackOpsCommand', () => {
	it('execute enables stack ops, undo disables them', () => {
		withReactivity(() => {
			const { fsa } = makeFSA();
			const cmd = new EnableStackOpsCommand();
			cmd.execute(fsa);
			expect(fsa.hasStackOps).toBe(true);
			expect(fsa.transitions.every((t) => t.hasStackOps())).toBe(true);
			cmd.undo(fsa);
			expect(fsa.hasStackOps).toBe(false);
		});
	});
});

// --- DisableStackOpsCommand

describe('DisableStackOpsCommand', () => {
	it('execute disables stack ops, undo restores previous pop/push values', () => {
		withReactivity(() => {
			const { fsa, edge } = makeFSA();
			const pop = 'x';
			const push = 'y';
			fsa.hasStackOps = true;
			edge.transitions[0].popRawValue = pop;
			edge.transitions[0].pushRawValue = push;
			const cmd = new DisableStackOpsCommand();
			cmd.execute(fsa);
			expect(fsa.hasStackOps).toBe(false);
			expect(fsa.transitions.every((t) => !t.hasStackOps())).toBe(true);
			cmd.undo(fsa);
			expect(fsa.hasStackOps).toBe(true);
			expect(edge.transitions[0].pop).toBe(pop);
			expect(edge.transitions[0].push).toBe(push);
		});
	});
});
