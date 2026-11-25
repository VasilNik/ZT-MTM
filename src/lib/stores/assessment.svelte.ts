
const STORAGE_KEY = 'zt-mtm-assessment-v04';

interface AssessmentState {
	profile: Record<string, string>;
	branche: string | null;
	filters: Record<string, 'ja' | 'nein'>;
	targetLevel: number;
	answers: Record<string, number | 'N/A'>;
}

function load(): AssessmentState {
	const fb: AssessmentState = { profile: {}, branche: null, filters: {}, targetLevel: 2, answers: {} };
	try {
		if (typeof localStorage === 'undefined') return fb;
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...fb, ...JSON.parse(raw) } : fb;
	} catch {
		return fb;
	}
}

export const assessment = $state<AssessmentState>(load());

function save() {
	try {
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(assessment));
	} catch {
		// ignorieren
	}
}

export function setProfile(id: string, value: string) {
	assessment.profile[id] = value;
	save();
}
export function setBranche(value: string) {
	assessment.branche = value;
	save();
}
export function setFilter(id: string, value: 'ja' | 'nein') {
	assessment.filters[id] = value;
	save();
}
export function setTargetLevel(level: number) {
	assessment.targetLevel = level;
	save();
}
export function setAnswer(criterionId: string, value: number | 'N/A') {
	assessment.answers[criterionId] = value;
	save();
}
export function reset() {
	assessment.profile = {};
	assessment.branche = null;
	assessment.filters = {};
	assessment.targetLevel = 2;
	assessment.answers = {};
	save();
}