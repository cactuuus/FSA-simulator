import type { FSAGraph } from '$lib/automata-models';
import { type Serializable } from '$lib/utils/serialization';
import { Command, type SerializedCommand } from './base';
import { getCommandConstructor } from './registry';

/**
 * Serialized representation of the command history.
 */
export interface SerializedCommandHistory {
	commands: SerializedCommand[];
	pointer: number;
}

/**
 * Manages the history of executed commands, allowing for undo and redo functionality.
 * It maintains an array of commands and a pointer to the current position in the history. This seems simpler and more effective than maintaining separate undo and redo stacks.
 */
export class CommandHistory implements Serializable<SerializedCommandHistory> {
	static readonly MAX_HISTORY_LENGTH = 50;

	private _fsa: FSAGraph;
	private _commands: Command[] = $state([]);
	private _pointer: number = $state(-1);
	canUndo = $derived(this._pointer >= 0);
	canRedo = $derived(this._pointer < this._commands.length - 1);

	constructor(fsa: FSAGraph) {
		this._fsa = fsa;
	}

	/**
	 * Retrieves the next command that would be undone if `undo()` is called.
	 * Returns `null` if there is no command to undo.
	 */
	peekUndo(): Command | null {
		if (!this.canUndo) return null;
		return this._commands[this._pointer];
	}

	/**
	 * Retrieves the next command that would be redone if `redo()` is called.
	 * Returns `null` if there is no command to redo.
	 */
	peekRedo(): Command | null {
		if (!this.canRedo) return null;
		return this._commands[this._pointer + 1];
	}

	/**
	 * Pushes a new command onto the history without executing it.
	 * All currently available redoable commands are discarded.
	 * @param command The command to push onto the history.
	 */
	push(command: Command): void {
		this._commands = this._commands.slice(0, this._pointer + 1);
		this._commands.push(command);
		if (this._commands.length > CommandHistory.MAX_HISTORY_LENGTH) {
			this._commands.shift();
		}
		// newly pushed commands will always be at the end of the array
		this._pointer = this._commands.length - 1;
	}

	/**
	 * Pushes a new command onto the history and executes it.
	 * All currently available redoable commands are discarded.
	 * @param command The command to push and execute.
	 */
	pushAndExecute(command: Command): void {
		command.execute(this._fsa);
		this.push(command);
	}

	/**
	 * Undoes the command currently pointed to in the history.
	 * @returns The command that was undone, or `null` if there was no command to undo.
	 */
	undo(): Command | null {
		if (!this.canUndo) return null;
		const command = this._commands[this._pointer];
		command.undo(this._fsa);
		this._pointer--;
		return command;
	}

	/**
	 * Redoes the command currently pointed to in the history.
	 * @returns The command that was redone, or `null` if there was no command to redo.
	 */
	redo(): Command | null {
		if (!this.canRedo) return null;
		this._pointer++;
		const command = this._commands[this._pointer];
		command.execute(this._fsa);
		return command;
	}

	/**
	 * Clears all commands and resets the pointer.
	 */
	reset(): void {
		this._commands = [];
		this._pointer = -1;
	}

	toJSON(): SerializedCommandHistory {
		return {
			commands: this._commands.map((cmd) => cmd.toJSON()),
			pointer: this._pointer
		};
	}

	loadFromJSON(json: SerializedCommandHistory): void {
		this._commands = json.commands.map((cmdJson) => {
			const commandConstructor = getCommandConstructor(cmdJson.id);
			return commandConstructor.fromJSON(cmdJson);
		});
		this._pointer = json.pointer;
	}
}
