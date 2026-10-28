interface AssessmentState {
	scopeId: string | null;
	targetLevel: number;
	answers: Record<string, number | 'N/A'>;
}

export const assessment = $state<AssessmentState>({
	scopeId: null,
	targetLevel: 3,
	answers: {}
});

export function setScope(id: string) {
	assessment.scopeId = id;
}

export function setTargetLevel(level: number) {
	assessment.targetLevel = level;
}

export function setAnswer(criterionId: string, value: number | 'N/A') {
	assessment.answers[criterionId] = value;
}