const STORAGE_KEY = 'zt-mtm-assessment';

interface AssessmentState {
	scopeId: string | null;
	targetLevel: number;
	answers: Record<string, number | 'N/A'>;
}

function load(): AssessmentState {
	const fb: AssessmentState = { scopeId: null, targetLevel: 3, answers: {} };
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

export function setScope(id: string) {
	assessment.scopeId = id;
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
	assessment.scopeId = null;
	assessment.targetLevel = 3;
	assessment.answers = {};
	save();
}