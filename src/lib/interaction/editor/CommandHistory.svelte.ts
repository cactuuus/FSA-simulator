import type { FSAGraph } from '$lib/automata/models';
import { type Serializable } from '$lib/utils/serialization';
import {
	Command,
	getCommandConstructor,
	type SerializedCommand
} from '$lib/interaction/editor/commands';

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
	get nextUndoCommand(): Command | null {
		if (!this.canUndo) return null;
		return this._commands[this._pointer];
	}

	/**
	 * Retrieves the next command that would be redone if `redo()` is called.
	 * Returns `null` if there is no command to redo.
	 */
	get nextRedoCommand(): Command | null {
		if (!this.canRedo) return null;
		return this._commands[this._pointer + 1];
	}

	/**
	 * Executes a new command and adds it to the history. This clears any redoable commands currently in the history.
	 * @param command The command to execute.
	 */
	execute(command: Command): void {
		command.execute(this._fsa);
		this._commands = this._commands.slice(0, this._pointer + 1);
		this._commands.push(command);
		this._pointer++;
	}

	/**
	 * Undoes the command currently pointed to in the history.
	 */
	undo(): void {
		if (!this.canUndo) return;
		this._commands[this._pointer].undo(this._fsa);
		this._pointer--;
	}

	/**
	 * Redoes the command currently pointed to in the history.
	 */
	redo(): void {
		if (!this.canRedo) return;
		this._pointer++;
		this._commands[this._pointer].execute(this._fsa);
	}

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
