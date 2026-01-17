/**
 * Interface for serializable objects. Forces the implementation of a toJson method, used by the
 * JSON.stringify function.
 * @template T The type returned by the toJSON method.
 */
export interface Serializable<T> {
	toJSON(): T;
}
