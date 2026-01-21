import { FSAGraph, FSAType } from '$lib/automata/models';

/**
 * Result of FSA validation containing warnings and errors.
 */
export interface ValidationResult {
	warnings: string[];
	errors: string[];
}

/**
 * Validates a given FSA graph, returning any warnings or errors found.
 * @param fsa The FSA graph to validate.
 * @returns A ValidationResult object containing warnings and errors.
 */
export function validateFSA(fsa: FSAGraph): ValidationResult {
	const generalValidation: ValidationResult = basicValidation(fsa);
	if (generalValidation.errors.length > 0) {
		// early return if the basic validation failed, no point in continuing
		return generalValidation;
	}

	let typeSpecificValidation: ValidationResult;
	switch (fsa.type) {
		case FSAType.DFA:
			typeSpecificValidation = DfaSpecificValidation(fsa);
			break;
		case FSAType.NFA:
			typeSpecificValidation = NfaSpecificValidation(fsa);
			break;
		case FSAType.PDA:
			typeSpecificValidation = PdaSpecificValidation(fsa);
			break;
		case FSAType.DPDA:
			typeSpecificValidation = DpdaSpecificValidation(fsa);
			break;
		default:
			throw new Error(`Unknown FSA type: ${fsa.type}`);
	}
	return {
		warnings: [...generalValidation.warnings, ...typeSpecificValidation.warnings],
		errors: [...generalValidation.errors, ...typeSpecificValidation.errors]
	};
}

/**
 * Performs basic validation checks applicable to all FSA types.
 * @param fsa The FSA graph to validate.
 * @returns A ValidationResult object containing warnings and errors.
 */
function basicValidation(fsa: FSAGraph): ValidationResult {
	const result: ValidationResult = { warnings: [], errors: [] };
	if (fsa.isEmpty) {
		result.errors.push('The FSA is empty.');
	}
	if (!fsa.hasStart) {
		result.errors.push('The FSA has no start state.');
	}
	if (!fsa.hasAcceptingNodes) {
		result.warnings.push('The FSA has no accepting states. It will reject any input.');
	}
	return result;
}

/**
 * Performs DFA specific validation checks.
 * @param fsa The DFA graph to validate.
 * @returns A ValidationResult object containing warnings and errors.
 */
function DfaSpecificValidation(fsa: FSAGraph): ValidationResult {
	if (fsa.type !== FSAType.DFA) throw new Error('The FSA passed is not a DFA.');
	const validation: ValidationResult = { warnings: [], errors: [] };
	// DFA validation logic
	return validation;
}

/**
 * Performs NFA specific validation checks.
 * @param fsa The NFA graph to validate.
 * @returns A ValidationResult object containing warnings and errors.
 */
function NfaSpecificValidation(fsa: FSAGraph): ValidationResult {
	if (fsa.type !== FSAType.NFA) throw new Error('The FSA passed is not an NFA.');
	const validation: ValidationResult = { warnings: [], errors: [] };
	// NFA validation logic
	return validation;
}

/**
 * Performs DPDA specific validation checks.
 * @param fsa The DPDA graph to validate.
 * @returns A ValidationResult object containing warnings and errors.
 */
function DpdaSpecificValidation(fsa: FSAGraph): ValidationResult {
	if (fsa.type !== FSAType.DPDA) throw new Error('The FSA passed is not a DPDA.');
	const validation: ValidationResult = { warnings: [], errors: [] };
	// DPDA validation logic
	return validation;
}

/**
 * Performs PDA specific validation checks.
 * @param fsa The PDA graph to validate.
 * @returns A ValidationResult object containing warnings and errors.
 */
function PdaSpecificValidation(fsa: FSAGraph): ValidationResult {
	if (fsa.type !== FSAType.PDA) throw new Error('The FSA passed is not a PDA.');
	const validation: ValidationResult = { warnings: [], errors: [] };
	// PDA validation logic
	return validation;
}
