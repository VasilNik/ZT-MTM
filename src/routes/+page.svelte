<script lang="ts">
	import { resolve } from "$app/paths";
	import { catalog, targetLevels, visibleCriteria } from "../lib/catalog";
	import {
		assessment,
		setProfile,
		setBranche,
		setFilter,
		setTargetLevel,
	} from "../lib/stores/assessment.svelte";
	import AppHeader from "../lib/components/AppHeader.svelte";

	const relevant = $derived(visibleCriteria(assessment.filters));
	const total = $derived(relevant.length);
	const answeredCount = $derived(
		relevant.filter((c) => assessment.answers[c.id] !== undefined).length,
	);
	const selectedBranche = $derived(
		catalog.branche.options.find((b) => b.name === assessment.branche) ??
			null,
	);
</script>

<svelte:head><title>ZT-MTM Einrichtung</title></svelte:head>

<div class="container">
	<AppHeader />

	<main>
		<p class="step">Schritt 1 von 4 | Einrichtung</p>
		<h1>Zero-Trust-Reifegrad Ihres Unternehmens bestimmen</h1>
		<p class="lead">
			Beantworten Sie ein kurzes Profil und die Filterfragen. Danach
			bewerten Sie bis zu
			{catalog.criteria.length} Kriterien in {catalog.areas.length} Bereichen
			und erhalten Ihren Reifegrad samt Transformationspfad.
		</p>

		<div class="progress">
			<div class="progress-head">
				<span>Fortschritt</span>
				<span class="mono">{answeredCount} / {total} Kriterien</span>
			</div>
			<div class="bar">
				<div
					class="fill"
					style="width: {total ? (answeredCount / total) * 100 : 0}%"
				></div>
			</div>
		</div>

		<section class="card">
			<h2>Profil</h2>
			<p class="hint">
				Kurzer Kontext zu Ihrem Unternehmen. Beeinflusst später den
				Ziel-Vorschlag und die Empfehlungen.
			</p>
			{#each catalog.profile as pq (pq.id)}
				<div class="field">
					<p class="q">{pq.question}</p>
					<div class="opts">
						{#each pq.options as opt (opt)}
							<button
								type="button"
								class="opt"
								class:selected={assessment.profile[pq.id] ===
									opt}
								onclick={() => setProfile(pq.id, opt)}
								>{opt}</button
							>
						{/each}
					</div>
				</div>
			{/each}
		</section>

		<section class="card">
			<h2>Branche</h2>
			<p class="hint">
				{catalog.branche.question} Nur zur Information — zeigt typische Risiken,
				ändert die Bewertung nicht.
			</p>
			<select
				class="select"
				value={assessment.branche ?? ""}
				onchange={(e) => setBranche(e.currentTarget.value)}
			>
				<option value="" disabled>Bitte wählen …</option>
				{#each catalog.branche.options as b (b.name)}
					<option value={b.name}>{b.name}</option>
				{/each}
			</select>
			{#if selectedBranche?.risks}
				<div class="info">
					<strong>Typische Risiken:</strong>
					{selectedBranche.risks}
				</div>
			{/if}
		</section>

		<section class="card">
			<h2>Filterfragen</h2>
			<p class="hint">
				Trifft das auf Ihr Unternehmen zu? Bei „Nein" werden die
				zugehörigen Kriterien ausgeblendet.
			</p>
			{#each catalog.filterQuestions as f (f.id)}
				<div class="filter-row">
					<span class="filter-q">{f.question}</span>
					<div class="yesno">
						<button
							type="button"
							class="yn"
							class:selected={assessment.filters[f.id] === "ja"}
							onclick={() => setFilter(f.id, "ja")}>Ja</button
						>
						<button
							type="button"
							class="yn"
							class:selected={assessment.filters[f.id] === "nein"}
							onclick={() => setFilter(f.id, "nein")}>Nein</button
						>
					</div>
				</div>
			{/each}
		</section>

		<section class="card">
			<h2>Ziel-Reifegrad</h2>
			<p class="hint">
				Standard für KMU ist „grundlegend". Der angestrebte Zielzustand
				bestimmt die Reifegradlücke.
			</p>
			<div class="segments">
				{#each targetLevels as level (level.value)}
					<button
						type="button"
						class="segment"
						class:selected={assessment.targetLevel === level.value}
						onclick={() => setTargetLevel(level.value as number)}
						>{level.value} {level.label}</button
					>
				{/each}
			</div>
		</section>

		<div class="cta">
			<a href={resolve("/assessment")} class="btn-primary"
				>Assessment starten</a
			>
			<span class="cta-note">{total} Kriterien werden abgefragt.</span>
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
		margin: 0 0 24px;
	}

	.progress {
		margin-bottom: 24px;
	}
	.progress-head {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
		color: var(--muted);
		margin-bottom: 8px;
	}
	.bar {
		height: 8px;
		background: #edeff2;
		border-radius: 999px;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		background: var(--primary);
		border-radius: 999px;
		transition: width 0.2s;
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

	.field {
		margin-bottom: 20px;
	}
	.field:last-child {
		margin-bottom: 0;
	}
	.q {
		font-size: 15px;
		font-weight: 600;
		margin: 0 0 10px;
	}
	.opts {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.opt {
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: var(--radius);
		padding: 9px 14px;
		font-size: 14px;
		font-family: inherit;
		color: var(--ink);
		cursor: pointer;
	}
	.opt:hover {
		border-color: #c7d0dc;
	}
	.opt.selected {
		border: 2px solid var(--primary);
		background: var(--primary-soft);
		color: var(--primary);
		font-weight: 600;
		padding: 8px 13px;
	}

	.select {
		width: 100%;
		padding: 12px 14px;
		font-size: 15px;
		font-family: inherit;
		color: var(--ink);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
	}
	.info {
		margin-top: 14px;
		font-size: 14px;
		line-height: 1.5;
		background: var(--teal-soft);
		border: 1px solid #cde6df;
		border-radius: var(--radius);
		padding: 14px 16px;
		color: #1a3b35;
	}

	.filter-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 12px 0;
		border-bottom: 1px solid var(--border);
	}
	.filter-row:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}
	.filter-q {
		font-size: 14px;
	}
	.yesno {
		display: flex;
		gap: 8px;
		flex: none;
	}
	.yn {
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: var(--radius);
		padding: 8px 18px;
		font-size: 14px;
		font-family: inherit;
		color: var(--ink);
		cursor: pointer;
	}
	.yn:hover {
		border-color: #c7d0dc;
	}
	.yn.selected {
		border: 2px solid var(--primary);
		background: var(--primary-soft);
		color: var(--primary);
		font-weight: 600;
		padding: 7px 17px;
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
		background: var(--primary);
		color: #fff;
		font-weight: 600;
		font-size: 16px;
		padding: 16px 28px;
		border: 0;
		border-radius: var(--radius);
		cursor: pointer;
		font-family: inherit;
		text-decoration: none;
	}
	.cta-note {
		font-size: 14px;
		color: var(--muted);
	}
</style>
