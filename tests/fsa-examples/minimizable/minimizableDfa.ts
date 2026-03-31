import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { type SerializedFSAGraph } from '$lib/automata-models';

const dir = dirname(fileURLToPath(import.meta.url));

function loadFSA(filename: string): SerializedFSAGraph {
	return JSON.parse(readFileSync(resolve(dir, filename), 'utf-8'));
}

export interface MinimizableDFAExample {
	fsa: SerializedFSAGraph;
	language: string;
	minimizedNodeCount: number;
	validInputs: string[];
	invalidInputs: string[];
}

export const minimizableDFAExamples: MinimizableDFAExample[] = [
	{
		fsa: loadFSA('unreachable_1.fsa'),
		language: 'L={b(a|b)*}',
		minimizedNodeCount: 3,
		validInputs: ['b', 'ba', 'bb', 'bab', 'bba', 'baab', 'bbbb'],
		invalidInputs: ['', 'a', 'ab', 'aa', 'abb', 'aab']
	},
	{
		fsa: loadFSA('indistinguishable_1.fsa'),
		language: 'L={(aa|bb)(a|b)*}',
		minimizedNodeCount: 5,
		validInputs: ['aa', 'bb', 'aaa', 'bbb', 'aab', 'bba', 'aaab', 'bbba'],
		invalidInputs: ['', 'a', 'b', 'ab', 'ba', 'aba', 'bab']
	},
	{
		fsa: loadFSA('mixed_1.fsa'),
		language: 'L={101(0|1)*}',
		minimizedNodeCount: 5,
		validInputs: ['101', '1010', '1011', '10100', '10111', '101010', '101101'],
		invalidInputs: ['', '0', '1', '10', '100', '110', '011', '001']
	},
	{
		fsa: loadFSA('mixed_2.fsa'),
		language: 'L={((hello)(hello)|(world)(world))((hello)|(world))*}',
		minimizedNodeCount: 5,
		validInputs: [
			'hello,hello',
			'world,world',
			'hello,hello,hello',
			'world,world,world',
			'hello,hello,world',
			'world,world,hello',
			'hello,hello,hello,world',
			'world,world,world,hello'
		],
		invalidInputs: [
			'',
			'hello',
			'world',
			'hello,world',
			'world,hello',
			'hello,world,hello',
			'world,hello,world'
		]
	}
];
