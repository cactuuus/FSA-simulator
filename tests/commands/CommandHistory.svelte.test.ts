import { describe, it, expect } from 'vitest';
import { FSAGraph } from '$lib/automata-models';
import { CommandHistory } from '$lib/editor/commands';
import { AddNodeCommand } from '$lib/editor/commands/instances';
import { withReactivity } from '../helpers.svelte';

// --- Helpers

function setup(): { fsa: FSAGraph; history: CommandHistory } {
	const fsa = new FSAGraph();
	const history = new CommandHistory(fsa);
	return { fsa, history };
}

// --- Tests

describe('CommandHistory', () => {
	it('pushAndExecute executes the command and adds it to history', () => {
		withReactivity(() => {
			const { fsa, history } = setup();
			history.pushAndExecute(new AddNodeCommand({ x: 0, y: 0 }));
			expect(fsa.nodes).toHaveLength(1);
			expect(history.canUndo).toBe(true);
		});
	});

	it('undo reverts the last command', () => {
		withReactivity(() => {
			const { fsa, history } = setup();
			history.pushAndExecute(new AddNodeCommand({ x: 0, y: 0 }));
			history.undo();
			expect(fsa.nodes).toHaveLength(0);
			expect(history.canRedo).toBe(true);
		});
	});

	it('redo re-executes the undone command', () => {
		withReactivity(() => {
			const { fsa, history } = setup();
			history.pushAndExecute(new AddNodeCommand({ x: 0, y: 0 }));
			history.undo();
			history.redo();
			expect(fsa.nodes).toHaveLength(1);
		});
	});

	it('cannot undo on empty history', () => {
		withReactivity(() => {
			const { history } = setup();
			expect(history.canUndo).toBe(false);
		});
	});

	it('cannot redo when nothing has been undone', () => {
		withReactivity(() => {
			const { history } = setup();
			history.pushAndExecute(new AddNodeCommand({ x: 0, y: 0 }));
			expect(history.canRedo).toBe(false);
		});
	});

	it('pushing after an undo discards the redo stack', () => {
		withReactivity(() => {
			const { history } = setup();
			history.pushAndExecute(new AddNodeCommand({ x: 0, y: 0 }));
			history.undo();
			expect(history.canRedo).toBe(true);
			history.pushAndExecute(new AddNodeCommand({ x: 100, y: 0 }));
			expect(history.canRedo).toBe(false);
		});
	});

	it('peekUndo returns the last command without moving the pointer', () => {
		withReactivity(() => {
			const { history } = setup();
			const cmd = new AddNodeCommand({ x: 0, y: 0 });
			history.pushAndExecute(cmd);
			expect(history.peekUndo()?.id).toBe(cmd.id);
			expect(history.canUndo).toBe(true);
		});
	});

	it('peekRedo returns the next command without moving the pointer', () => {
		withReactivity(() => {
			const { history } = setup();
			const cmd = new AddNodeCommand({ x: 0, y: 0 });
			history.pushAndExecute(cmd);
			history.undo();
			expect(history.peekRedo()?.id).toBe(cmd.id);
			expect(history.canRedo).toBe(true);
		});
	});

	it('history is capped at MAX_HISTORY_LENGTH', () => {
		withReactivity(() => {
			const { history } = setup();
			for (let i = 0; i < CommandHistory.MAX_HISTORY_LENGTH + 10; i++) {
				history.pushAndExecute(new AddNodeCommand({ x: i, y: 0 }));
			}
			// after capping, we can only undo MAX_HISTORY_LENGTH times
			let undoCount = 0;
			while (history.canUndo) {
				history.undo();
				undoCount++;
			}
			expect(undoCount).toBe(CommandHistory.MAX_HISTORY_LENGTH);
		});
	});

	it('reset clears all commands and resets the pointer', () => {
		withReactivity(() => {
			const { history } = setup();
			history.pushAndExecute(new AddNodeCommand({ x: 0, y: 0 }));
			history.reset();
			expect(history.canUndo).toBe(false);
			expect(history.canRedo).toBe(false);
		});
	});
});
