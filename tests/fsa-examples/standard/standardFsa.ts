import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FSAType, type SerializedFSAGraph } from '$lib/automata-models';

const dir = dirname(fileURLToPath(import.meta.url));

function loadFSA(filename: string): SerializedFSAGraph {
	return JSON.parse(readFileSync(resolve(dir, filename), 'utf-8'));
}

export interface FSAExample {
	fsa: SerializedFSAGraph;
	type: FSAType;
	language: string;
	validInputs: string[];
	invalidInputs: string[];
}

const examples: FSAExample[] = [
	{
		fsa: loadFSA('NFA_1.fsa'),
		type: FSAType.NFA,
		language: 'L={(0|1)*(101|010)(0|1)*}',
		validInputs: [
			'101',
			'010',
			'0101',
			'1010',
			'00101',
			'11010',
			'001011',
			'110100',
			'10100',
			'01011'
		],
		invalidInputs: ['000', '111', '00', '11', '0', '1', '', '0000', '1111', '001100']
	},
	{
		fsa: loadFSA('NFA_2.fsa'),
		type: FSAType.NFA,
		language: 'L={a*|(ab)*}',
		validInputs: ['', 'a', 'aa', 'aaa', 'ab', 'abab', 'ababab'],
		invalidInputs: ['b', 'ba', 'abb', 'bab', 'aab', 'aba', 'bba']
	},
	{
		fsa: loadFSA('NFA_3.fsa'),
		type: FSAType.NFA,
		language: 'L={101(0|1)*101}',
		validInputs: ['101101', '1010101', '1011101', '101000101', '101110101', '1010010101'],
		invalidInputs: ['101', '010', '10101', '1001001', '0101010', '110', '1010']
	},
	{
		fsa: loadFSA('NFA_4.fsa'),
		type: FSAType.NFA,
		language: 'L={1*|((0|1)*0)}',
		validInputs: ['', '1', '11', '111', '0', '10', '00', '110', '010', '1010'],
		invalidInputs: ['01', '001', '101', '0101', '10111', '0011']
	},
	{
		fsa: loadFSA('NFA_5.fsa'),
		type: FSAType.NFA,
		language: 'L={(hello)*|((hello|world)*world)}',
		validInputs: [
			'',
			'hello',
			'hello,hello',
			'world',
			'hello,world',
			'world,world',
			'hello,world,world',
			'world,hello,world'
		],
		invalidInputs: ['hello,world,hello', 'world,hello', 'hello,worl', 'wor', 'helo', 'hellohello']
	},
	{
		fsa: loadFSA('DFA_1.fsa'),
		type: FSAType.DFA,
		language: 'L={acd(a|b|c)*bad}',
		validInputs: ['acdbad', 'acdabad', 'acdcbad', 'acdaabad', 'acdabcbad', 'acdbbad', 'acdcabad'],
		invalidInputs: ['acd', 'bad', '', 'acdbad1', 'acdbadd', 'acbad', 'adcbad']
	},
	{
		fsa: loadFSA('DFA_2.fsa'),
		type: FSAType.DFA,
		language: 'L={(a|b)*}',
		validInputs: ['', 'a', 'b', 'ab', 'ba', 'aabb', 'bbaa', 'abab'],
		invalidInputs: ['c', 'ac', 'bc', 'abc', '1', 'a1', 'A']
	},
	{
		fsa: loadFSA('DFA_3.fsa'),
		type: FSAType.DFA,
		language: 'L={b(a|b)*}',
		validInputs: ['b', 'ba', 'bb', 'bab', 'bba', 'baab', 'bbbb', 'baaab'],
		invalidInputs: ['', 'a', 'ab', 'aa', 'abb', 'aab', 'aba']
	},
	{
		fsa: loadFSA('DFA_4.fsa'),
		type: FSAType.DFA,
		language: 'L={(aa|bb)(a|b)*}',
		validInputs: ['aa', 'bb', 'aaa', 'bbb', 'aab', 'bba', 'aaab', 'bbba'],
		invalidInputs: ['', 'a', 'b', 'ab', 'ba', 'aba', 'bab']
	},
	{
		fsa: loadFSA('DFA_5.fsa'),
		type: FSAType.DFA,
		language: 'L={((world)(world)|(hello)(hello))((hello)|(world))*}',
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
	},
	{
		fsa: loadFSA('DPDA_1.fsa'),
		type: FSAType.DPDA,
		language: 'L={0^n1^n|n>0}',
		validInputs: ['01', '0011', '000111', '00001111', '0000011111'],
		invalidInputs: ['001', '011', '', '10', '0', '1', '0101', '00011']
	},
	{
		fsa: loadFSA('PDA_1.fsa'),
		type: FSAType.PDA,
		language: 'L={ww^R|w∈Σ*}',
		validInputs: ['0110', '1001', '00', '11', '0000', '1111', '010010', '01100110'],
		invalidInputs: ['01', '10', '001', '0010', '0111', '010']
	}
];

export const fsaExamples = examples;
export const nfaExamples = examples.filter((e) => e.type === FSAType.NFA);
export const dfaExamples = examples.filter((e) => e.type === FSAType.DFA);
export const dpdaExamples = examples.filter((e) => e.type === FSAType.DPDA);
export const pdaExamples = examples.filter((e) => e.type === FSAType.PDA);
export const nonPushdownExamples = examples.filter((e) => !e.fsa.hasStackOps);
export const pushdownExamples = examples.filter((e) => e.fsa.hasStackOps);
