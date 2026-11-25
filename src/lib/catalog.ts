import catalogData from './data/zt-mtm-catalog.json';

export type MaturityValue = number | 'N/A';

export interface MaturityLevel {
	value: MaturityValue;
	label: string;
}

export interface Area {
	id: string;
	label: string;
	order?: number;
	criteriaCount?: number;
}

export type SocioTechnical = 'technical' | 'organizational' | 'human';

export interface ProfileQuestion {
	id: string;
	question: string;
	effect: string | null;
	options: string[];
}

export interface BrancheOption {
	name: string;
	risks: string | null;
	typicalFilters: string | null;
}

export interface Branche {
	id: string;
	question: string;
	note: string | null;
	options: BrancheOption[];
}

export interface FilterQuestion {
	id: string;
	question: string;
	hidesCriteria: string[];
}

export interface Criterion {
	id: string;
	areaId: string;
	shortTitle: string;
	question: string;
	weight: number;
	socioTechnical: SocioTechnical[];
	levelDescriptions: Record<'0' | '1' | '2' | '3' | '4', string | null>;
	recommendationsByTargetLevel: Record<'1' | '2' | '3' | '4', string | null>;
	barriers: string | null;
	barrierReduction: string | null;
	whyImportant: string | null;
	hint: string | null;
	questionToProvider: string | null;
	effort: string | null;
	implementedBy: string | null;
	quickWin: string | null;
	prerequisite: string | null;
	refV1: string | null;
	filterQuestion: string | null;
}

export interface Catalog {
	model: { name: string; abbrev?: string; version: string; sourceLanguage?: string };
	maturityLevels: MaturityLevel[];
	profile: ProfileQuestion[];
	branche: Branche;
	filterQuestions: FilterQuestion[];
	areas: Area[];
	criteria: Criterion[];
}

export const catalog = catalogData as Catalog;

export const numericLevels: number[] = catalog.maturityLevels
	.map((l) => l.value)
	.filter((v): v is number => typeof v === 'number')
	.sort((a, b) => a - b);

export const targetLevels: MaturityLevel[] = catalog.maturityLevels.filter(
	(l) => typeof l.value === 'number' && l.value >= 2
);

export function isVisible(criterion: Criterion, filters: Record<string, string>): boolean {
	return criterion.filterQuestion === null || filters[criterion.filterQuestion] !== 'nein';
}

export function visibleCriteria(filters: Record<string, string>): Criterion[] {
	return catalog.criteria.filter((c) => isVisible(c, filters));
}