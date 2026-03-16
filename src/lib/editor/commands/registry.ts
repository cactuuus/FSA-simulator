import { Command, type SerializedCommand } from './base';

/**
 * Type for command constructor. This is purely used in order to have a type-safe (at compile time) way to register and retrieve command constructors based on their ID, which is necessary for deserialization of commands from JSON.
 * @template T The type of the data contained in the command.
 */
type CommandConstructor<T = unknown> = {
	fromJSON(_commandJson: SerializedCommand<T>): Command<T>;
};

/**
 * Maps a command ID (or any string for all that matters) to a command constructor. Each command class should register itself in this registry, so that it can be properly deserialized from JSON when loading a saved graph.
 */
const commandRegistry = new Map<string, CommandConstructor>();

/**
 * Registers a command constructor in the command registry with a specific ID.
 * @param id The command ID, should be unique for each command class. This is used to identify the command type during deserialization from JSON.
 * @param constructor The constructor for the command.
 */
export function registerCommand<T>(id: string, constructor: CommandConstructor<T>): void {
	commandRegistry.set(id, constructor);
}

/**
 * Retrieves a command constructor from the command registry based on the given ID.
 * @param id The command ID to look up in the registry.
 * @returns The command constructor associated with the given ID.
 */
export function getCommandConstructor<T>(id: string): CommandConstructor<T> {
	return commandRegistry.get(id) as CommandConstructor<T>;
}
