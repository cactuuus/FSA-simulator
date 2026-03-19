import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FSAType, type SerializedFSAGraph } from '$lib/automata-models';

const dir = dirname(fileURLToPath(import.meta.url));

function loadFSA(filename: string): SerializedFSAGraph {
	return JSON.parse(readFileSync(resolve(dir, filename), 'utf-8'));
}

export interface InfiniteLoopFSAExample {
	fsa: SerializedFSAGraph;
	type: FSAType;
}

const infiniteLoopExamples: InfiniteLoopFSAExample[] = [
	{
		fsa: loadFSA('infinite_loop_NFA_1.fsa'),
		type: FSAType.NFA
	},
	{
		fsa: loadFSA('infinite_loop_NFA_2.fsa'),
		type: FSAType.NFA
	},
	{
		fsa: loadFSA('infinite_loop_PDA_1.fsa'),
		type: FSAType.PDA
	},
	{
		fsa: loadFSA('infinite_loop_PDA_2.fsa'),
		type: FSAType.PDA
	}
];

export const infiniteLoopFsaExamples = infiniteLoopExamples;
export const infiniteLoopNfaExamples = infiniteLoopExamples.filter((e) => e.type === FSAType.NFA);
export const infiniteLoopPdaExamples = infiniteLoopExamples.filter((e) => e.type === FSAType.PDA);
