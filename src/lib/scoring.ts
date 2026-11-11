import { catalog, type Criterion, type Area } from './catalog';

export type SocioKey = 'technical' | 'organizational' | 'human';

export const stageNames = ['inexistent', 'rudimentär', 'grundlegend', 'fortgeschritten', 'optimiert'];

export function stageLabel(value: number | null): string {
	if (value === null) return '–';
	return stageNames[Math.round(value)] ?? String(value);
}

function mean(xs: number[]): number | null {
	return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export interface CriterionResult {
	criterion: Criterion;
	ist: number | null;
	isNA: boolean;
	gap: number;
	priority: number;
}

export interface AreaResult {
	area: Area;
	average: number | null;
	gap: number;
	avgPriority: number;
	answered: number;
	total: number;
	criteria: CriterionResult[];
}

export interface SocioResult {
	key: SocioKey;
	label: string;
	average: number | null;
	answered: number;
}

export interface AssessmentResult {
	targetLevel: number;
	areas: AreaResult[];
	overallAverage: number | null;
	overallGap: number;
	answered: number;
	total: number;
	coverage: number;
	criteriaWithGap: number;
	avgPriority: number;
	goalAttainment: number | null;
	socio: SocioResult[];
	priorities: CriterionResult[];
}

export function computeResult(
	scopeId: string | null,
	targetLevel: number,
	answers: Record<string, number | 'N/A'>
): AssessmentResult {
	const relevant = scopeId
		? catalog.criteria.filter((c) => c.appliesToScopes.includes(scopeId))
		: [];

	const results: CriterionResult[] = relevant.map((c) => {
		const raw = answers[c.id];
		const isNA = raw === 'N/A';
		const ist = typeof raw === 'number' ? raw : null;
		const gap = ist === null ? 0 : Math.max(0, targetLevel - ist);
		return { criterion: c, ist, isNA, gap, priority: gap * c.weight };
	});
	const byId = new Map(results.map((r) => [r.criterion.id, r]));
	const answered = results.filter((r) => r.ist !== null);

	const areas: AreaResult[] = catalog.areas
		.slice()
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		.map((area) => {
			const crits = relevant.filter((c) => c.areaId === area.id).map((c) => byId.get(c.id)!);
			const ans = crits.filter((r) => r.ist !== null);
			const avg = mean(ans.map((r) => r.ist as number));
			return {
				area,
				average: avg,
				gap: avg === null ? 0 : Math.max(0, targetLevel - avg),
				avgPriority: mean(ans.map((r) => r.priority)) ?? 0,
				answered: ans.length,
				total: crits.length,
				criteria: crits
			};
		})
		.filter((a) => a.total > 0);

	const overallAverage = mean(answered.map((r) => r.ist as number));

	const socioDefs: { key: SocioKey; label: string }[] = [
		{ key: 'technical', label: 'Technisch' },
		{ key: 'organizational', label: 'Organisatorisch-prozessual' },
		{ key: 'human', label: 'Menschlich' }
	];
	const socio: SocioResult[] = socioDefs.map(({ key, label }) => {
		const ans = answered.filter((r) => r.criterion.socioTechnical.includes(key));
		return { key, label, average: mean(ans.map((r) => r.ist as number)), answered: ans.length };
	});

	const priorities = answered.filter((r) => r.priority > 0).sort((a, b) => b.priority - a.priority);

	const weightedGap = answered.reduce((s, r) => s + r.priority, 0);
	const weightedMax = answered.reduce((s, r) => s + r.criterion.weight * targetLevel, 0);
	const goalAttainment = weightedMax ? 1 - weightedGap / weightedMax : null;
	console.log('weightedGap', weightedGap, 'weightedMax', weightedMax, 'goalAttainment', goalAttainment);

	return {
		targetLevel,
		areas,
		overallAverage,
		overallGap: overallAverage === null ? 0 : Math.max(0, targetLevel - overallAverage),
		answered: answered.length,
		total: relevant.length,
		coverage: relevant.length ? answered.length / relevant.length : 0,
		criteriaWithGap: answered.filter((r) => r.gap > 0).length,
		avgPriority: mean(answered.map((r) => r.priority)) ?? 0,
		goalAttainment,
		socio,
		priorities
	};
}