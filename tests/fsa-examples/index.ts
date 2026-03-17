import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { SerializedFSAGraph } from '$lib/automata-models';

const dir = dirname(fileURLToPath(import.meta.url));

function loadFSA(filename: string): SerializedFSAGraph {
	return JSON.parse(readFileSync(resolve(dir, filename), 'utf-8'));
}

export const DFA = loadFSA('DFA_1.fsa');
export const NFA = loadFSA('NFA_1.fsa');
export const DPDA = loadFSA('DPDA_1.fsa');
export const PDA = loadFSA('PDA_1.fsa');
export const infiniteLoopPDAs = [
	loadFSA('infinite_loop_PDA_1.fsa'),
	loadFSA('infinite_loop_PDA_2.fsa')
];
export const infiniteLoopNFAs = [
	loadFSA('infinite_loop_NFA_1.fsa'),
	loadFSA('infinite_loop_NFA_2.fsa')
];
