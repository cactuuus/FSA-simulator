import type { FSAGraph } from '$lib/automata-models';
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
	toJSON(): SerializedCommand<T> {
		return {
			id: this.id,
			data: this.data
		};
	}
	toString(): string {
		return `${this.id}`;
	}
}

/**
 * COMMAND TEMPLATE -- use this as a starting point when creating new commands.
 */

// import { FSAGraph } from '$lib/automata-models';
// import { Command } from '../base';
// import { registerCommand } from '../registry';
//
// export interface TemplateData {}
//
// export class TemplateCommand extends Command<TemplateData> {
//     static ID = 'template-command';
//     id = TemplateCommand.ID;
//     data: TemplateData;
//
//     constructor() {
//         super();
//     }
//
//     execute(fsa: FSAGraph): void {}
//
//     undo(fsa: FSAGraph): void {}
//
//     static fromJSON(commandJson: { data: TemplateData }): TemplateCommand {
//         return new TemplateCommand();
//     }
// }
//
// registerCommand(TemplateCommand.ID, TemplateCommand);
