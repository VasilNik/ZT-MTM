<script lang="ts">
    import { resolve } from "$app/paths";
    import { catalog, type Criterion } from "../../lib/catalog";
    import { assessment } from "../../lib/stores/assessment.svelte";
    import { computeResult } from "../../lib/scoring";
    import AppHeader from "../../lib/components/AppHeader.svelte";

    const result = $derived(
        computeResult(
            assessment.filters,
            assessment.targetLevel,
            assessment.answers,
        ),
    );

    function areaLabel(id: string) {
        return catalog.areas.find((a) => a.id === id)?.label ?? id;
    }
    function rec(c: Criterion, level: number): string | null {
        if (level < 1 || level > 4) return null;
        return (
            c.recommendationsByTargetLevel[
                String(level) as "1" | "2" | "3" | "4"
            ] ?? null
        );
    }
</script>

<svelte:head><title>ZT-MTM Handlungsempfehlungen</title></svelte:head>

<div class="container">
    <AppHeader />

    <main>
        <div class="actions">
            <a href={resolve("/results")} class="btn-ghost">← Zur Auswertung</a>
            <button type="button" class="act" onclick={() => window.print()}
                >Report generieren</button
            >
        </div>

        <p class="step">Schritt 4 von 4 | Handlungsempfehlungen</p>
        <h1>Transformationspfad</h1>

        {#if result.priorities.length === 0}
            <p class="lead">
                {#if result.answered === 0}
                    Noch keine Kriterien bewertet. Beginnen Sie mit dem
                    Assessment.
                {:else}
                    Keine offenen Lücken – alle bewerteten Kriterien erreichen
                    bereits den Ziel-Reifegrad.
                {/if}
            </p>
            <a href={resolve("/assessment")} class="btn-primary"
                >Zum Assessment</a
            >
        {:else}
            <p class="lead">
                {result.priorities.length} Empfehlungen, sortiert nach Priorität
                (Gewicht × Lücke). Beginnen Sie oben – „Nächster Schritt" ist jeweils
                die konkrete nächste Massnahme.
            </p>

            <ol class="list">
                {#each result.priorities as p, i (p.criterion.id)}
                    <li class="rec">
                        <div class="rec-head">
                            <span class="rank">{i + 1}</span>
                            <div class="rec-title">
                                <p class="title">{p.criterion.shortTitle}</p>
                                <p class="area">
                                    {areaLabel(p.criterion.areaId)}
                                </p>
                            </div>
                            <div class="badges">
                                {#if p.criterion.quickWin === "ja"}<span
                                        class="badge qw">Quick Win</span
                                    >{/if}
                                {#if p.criterion.effort}<span class="badge"
                                        >Aufwand: {p.criterion.effort}</span
                                    >{/if}
                            </div>
                        </div>

                        <p class="meta">
                            Ist {p.ist} → Ziel {result.targetLevel} | Priorität {p.priority}
                            {#if p.criterion.implementedBy}
                                | Umsetzung: {p.criterion.implementedBy}{/if}
                        </p>

                        {#if rec(p.criterion, (p.ist ?? 0) + 1)}
                            <div class="next">
                                <span class="next-label"
                                    >Nächster Schritt (auf Stufe {(p.ist ?? 0) +
                                        1})</span
                                >
                                <p>{rec(p.criterion, (p.ist ?? 0) + 1)}</p>
                            </div>
                        {/if}

                        <details class="more">
                            <summary>Mehr Details</summary>
                            {#if rec(p.criterion, result.targetLevel)}
                                <p class="d-label">
                                    Empfehlung zum Ziel-Reifegrad
                                </p>
                                <p>{rec(p.criterion, result.targetLevel)}</p>
                            {/if}
                            {#if p.criterion.whyImportant}
                                <p class="d-label">Warum ist das wichtig?</p>
                                <p>{p.criterion.whyImportant}</p>
                            {/if}
                            {#if p.criterion.barriers}
                                <p class="d-label">Umsetzungshürden</p>
                                <p>{p.criterion.barriers}</p>
                            {/if}
                            {#if p.criterion.barrierReduction}
                                <p class="d-label">
                                    Ansätze zur Hürdenreduktion
                                </p>
                                <p>{p.criterion.barrierReduction}</p>
                            {/if}
                        </details>
                    </li>
                {/each}
            </ol>
        {/if}
    </main>
</div>

<style>
    .container {
        max-width: 860px;
        margin: 0 auto;
        padding: 0 24px 64px;
    }
    main {
        padding-top: 32px;
    }
    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-bottom: 20px;
    }
    .step {
        font-size: 12px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-weight: 600;
        margin: 0 0 8px;
    }
    h1 {
        font-size: 30px;
        line-height: 1.15;
        margin: 0 0 12px;
    }
    .lead {
        font-size: 15px;
        color: var(--muted);
        max-width: 640px;
        margin: 0 0 24px;
    }

    .list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .rec {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 22px;
    }
    .rec-head {
        display: flex;
        align-items: flex-start;
        gap: 14px;
    }
    .rank {
        flex: none;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        background: var(--primary);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .rec-title {
        flex: 1;
        min-width: 0;
    }
    .title {
        font-size: 16px;
        font-weight: 600;
        margin: 2px 0 2px;
    }
    .area {
        font-size: 13px;
        color: var(--muted);
        margin: 0;
    }
    .badges {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        flex: none;
    }
    .badge {
        font-size: 12px;
        background: #eef1f5;
        color: var(--muted);
        border-radius: 999px;
        padding: 4px 10px;
    }
    .badge.qw {
        background: var(--teal-soft);
        color: var(--teal);
        font-weight: 600;
    }
    .meta {
        font-size: 13px;
        color: var(--muted);
        margin: 12px 0 14px;
    }

    .next {
        background: var(--primary-soft);
        border-radius: var(--radius);
        padding: 14px 16px;
    }
    .next-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }
    .next p {
        margin: 6px 0 0;
        font-size: 14px;
        line-height: 1.5;
    }

    .more {
        margin-top: 14px;
    }
    .more summary {
        font-size: 13px;
        color: var(--primary);
        cursor: pointer;
        font-weight: 600;
    }
    .more p {
        font-size: 14px;
        line-height: 1.5;
        margin: 4px 0 10px;
    }
    .d-label {
        font-weight: 600;
        margin: 12px 0 2px !important;
        font-size: 13px;
    }

    .btn-ghost {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--ink);
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        padding: 9px 16px;
        border-radius: var(--radius);
        text-decoration: none;
        line-height: 1;
        display: inline-flex;
        align-items: center;
    }
    .btn-ghost:hover {
        border-color: #c7d0dc;
    }
    .btn-primary {
        display: inline-flex;
        background: var(--primary);
        color: #fff;
        font-weight: 600;
        font-size: 16px;
        padding: 14px 24px;
        border: 0;
        border-radius: var(--radius);
        text-decoration: none;
    }
    .act {
        display: inline-flex;
        align-items: center;
        line-height: 1;
        background: var(--primary);
        color: #fff;
        border: 0;
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        padding: 10px 16px;
        border-radius: var(--radius);
        text-decoration: none;
        cursor: pointer;
    }
    .act:hover {
        filter: brightness(1.08);
    }
</style>
