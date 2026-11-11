<script lang="ts">
	import { catalog, targetLevels } from "../lib/catalog";
	import {
		assessment,
		reset,
		setScope,
		setTargetLevel,
	} from "../lib/stores/assessment.svelte";
	import AppHeader from "../lib/components/AppHeader.svelte";
	import { resolve } from '$app/paths';

	const shownCount = catalog.criteria.length;

	const relevantCount = $derived(
		assessment.scopeId
			? catalog.criteria.filter((c) => c.appliesToScopes.includes(assessment.scopeId!)).length
			: 0
	);

	function handleReset() {
		if (confirm('Alle Eingaben wirklich zurücksetzen?')) reset();
	}
</script>

<svelte:head><title>ZT-MTM Einrichtung</title></svelte:head>

<div class="container">
	<AppHeader />

	<main>
		<p class="step">Schritt 1 von 4	Einrichtung</p>
		<h1>Zero-Trust-Reifegrad Ihres Unternehmens bestimmen</h1>
		<p class="lead">
			Beantworten Sie bis zu {shownCount} Kriterien in {catalog.areas.length} Bereichen.
			Sie erhalten Ihren Ist-Reifegrad, die Lücke zum Ziel und einen priorisierten
			Transformationspfad.
		</p>

		<section class="card">
			<h2>Geltungsbereich</h2>
			<p class="hint">
				Wählen Sie das Bewertungsobjekt. Nur die dafür relevanten
				Kriterien werden abgefragt.
			</p>
			<fieldset class="grid">
				<legend class="sr-only">Geltungsbereich wählen</legend>
				{#each catalog.scopes as scope (scope.id)}
					<label
						class="option"
						class:selected={assessment.scopeId === scope.id}
					>
						<input
							type="radio"
							name="scope"
							value={scope.id}
							checked={assessment.scopeId === scope.id}
							onchange={() => setScope(scope.id)}
						/>
						<span class="option-title">{scope.label}</span>
					</label>
				{/each}
			</fieldset>
		</section>

		<section class="card">
			<h2>Ziel-Reifegrad</h2>
			<p class="hint">
				Der angestrebte Zielzustand. Daraus wird die Reifegradlücke
				berechnet.
			</p>
			<div class="segments">
				{#each targetLevels as level (level.value)}
					<button
						type="button"
						class="segment"
						class:selected={assessment.targetLevel === level.value}
						aria-pressed={assessment.targetLevel === level.value}
						onclick={() => setTargetLevel(level.value as number)}
					>
						{level.value} {level.label}
					</button>
				{/each}
			</div>
		</section>

	<div class="cta">
	<button type="button" class="btn-reset" onclick={handleReset}>Daten zurücksetzen</button>
		{#if assessment.scopeId}
			<a href="{resolve('assessment')}" class="btn-primary">
				Assessment starten
			</a>
			<span class="cta-note">{relevantCount} Kriterien für diesen Geltungsbereich.</span>
		{:else}
			<button type="button" class="btn-primary" disabled>
				Assessment starten
			</button>
			<span class="cta-note">Bitte zuerst einen Geltungsbereich wählen.</span>
		{/if}
	</div>
	</main>
</div>

<style>
	.container {
		max-width: 860px;
		margin: 0 auto;
		padding: 0 24px 64px;
	}
	main {
		padding-top: 40px;
	}
	.step {
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-weight: 600;
		margin: 0 0 10px;
	}
	h1 {
		font-size: 32px;
		line-height: 1.15;
		margin: 0 0 12px;
	}
	.lead {
		font-size: 16px;
		color: var(--muted);
		max-width: 640px;
		margin: 0 0 28px;
	}
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 28px;
		margin-bottom: 20px;
	}
	.card h2 {
		font-size: 17px;
		margin: 0 0 4px;
	}
	.hint {
		font-size: 14px;
		color: var(--muted);
		margin: 0 0 18px;
	}
	.grid {
		border: 0;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}
	.option {
		display: flex;
		align-items: center;
		gap: 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 16px;
		cursor: pointer;
	}
	.option:hover {
		border-color: #c7d0dc;
	}
	.option.selected {
		border: 2px solid var(--primary);
		background: var(--primary-soft);
		padding: 15px;
	}
	.option input {
		accent-color: var(--primary);
		width: 18px;
		height: 18px;
		flex: none;
	}
	.option-title {
		font-weight: 600;
		font-size: 15px;
	}
	.segments {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	.segment {
		flex: 1 1 140px;
		text-align: center;
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 14px 8px;
		font-size: 14px;
		font-family: inherit;
		color: var(--muted);
		background: var(--surface);
		cursor: pointer;
	}
	.segment:hover {
		border-color: #c7d0dc;
	}
	.segment.selected {
		border: 2px solid var(--primary);
		background: var(--primary-soft);
		color: var(--primary);
		font-weight: 600;
	}
	.cta {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		
	}
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: var(--primary);
		color: #fff;
		font-weight: 600;
		font-size: 16px;
		padding: 16px 28px;
		border: 0;
		border-radius: var(--radius);
		cursor: pointer;
		font-family: inherit;
	}
	.btn-primary:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	a.btn-primary {
		text-decoration: none;
	}
	.btn-reset {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: var(--muted);
		color: #fff;
		font-weight: 600;
		font-size: 16px;
		padding: 16px 28px;
		border: 0;
		border-radius: var(--radius);
		cursor: pointer;
		font-family: inherit;
	}
	.cta-note {
		font-size: 14px;
		color: var(--muted);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
