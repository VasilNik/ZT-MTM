import catalogData from './data/zt-mtm-catalog.json';

export type MaturityValue = number | 'N/A';

export interface MaturityLevel {
	value: MaturityValue;
	label: string;
	description?: string;
}

export interface Scope {
	id: string;
	label: string;
}

export interface Area {
	id: string;
	label: string;
	order?: number;
	criteriaCount?: number;
}

export type SocioTechnical = 'technical' | 'organizational' | 'human';

export interface Criterion {
	id: string;
	areaId: string;
	question: string;
	weight: number;
	socioTechnical: SocioTechnical[];
	appliesToScopes: string[];
	explanation?: string | null;
	levelDescriptions: Record<'0' | '1' | '2' | '3' | '4', string | null>;
	implementationBarriers?: string | null;
	barrierReduction?: string | null;
	recommendationsByTargetLevel: Record<'1' | '2' | '3' | '4', string | null>;
}

export interface Catalog {
	model: { name: string; abbrev?: string; version: string; sourceLanguage?: string };
	maturityLevels: MaturityLevel[];
	scopes: Scope[];
	areas: Area[];
	criteria: Criterion[];
}

export const catalog = catalogData as Catalog;

export const targetLevels: MaturityLevel[] = catalog.maturityLevels.filter(
	(l) => typeof l.value === 'number' && l.value >= 2
);