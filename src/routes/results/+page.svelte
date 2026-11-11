<script lang="ts">
    import { catalog } from "../../lib/catalog";
    import { assessment } from "../../lib/stores/assessment.svelte";
    import { computeResult, stageLabel } from "../../lib/scoring";
    import AppHeader from "../../lib/components/AppHeader.svelte";
    import { resolve } from '$app/paths';

    const result = $derived(
        computeResult(
            assessment.scopeId,
            assessment.targetLevel,
            assessment.answers,
        ),
    );
    const scopeLabel = $derived(
        catalog.scopes.find((s) => s.id === assessment.scopeId)?.label ?? "—",
    );

    const fmt = (v: number | null) => (v === null ? "–" : v.toFixed(1));
    const pct = (v: number) => (v / 4) * 100;
</script>

<svelte:head><title>ZT-MTM Dashboard</title></svelte:head>

<div class="container">
    <AppHeader />

    <main>
        {#if !assessment.scopeId}
            <p class="step">Dashboard</p>
            <h1>Noch keine Bewertung vorhanden</h1>
            <p class="lead">
                Bitte wählen Sie zuerst einen Geltungsbereich und beantworten
                Sie die Kriterien.
            </p>
            <a href="{resolve('')}" class="btn-primary">Zur Einrichtung</a>
        {:else}
            <div class="actions">
                <a href="{resolve('assessment')}" class="btn-ghost">Bewertung bearbeiten</a>
                <button
                    type="button"
                    class="btn-ghost"
                    disabled
                    title="Kommt in Schritt G">PDF-Report</button
                >
            </div>

            <p class="step">Schritt 3 von 4 Dashboard</p>
            <h1>Auswertung: {scopeLabel}</h1>

            <div class="kpis">
                <div class="kpi">
                    <span class="kpi-label">Ist-Reifegrad gesamt</span>
                    <div class="kpi-num">
                        {fmt(result.overallAverage)}<span class="kpi-unit"
                            >/ 4</span
                        >
                    </div>
                    <span class="kpi-sub amber"
                        >Ziel {result.targetLevel.toFixed(1)} · Lücke {result.overallGap.toFixed(
                            1,
                        )}</span
                    >
                </div>
                <div class="kpi">
                    <span class="kpi-label">Abdeckung</span>
                    <div class="kpi-num">
                        {Math.round(result.coverage * 100)}<span
                            class="kpi-unit">%</span
                        >
                    </div>
                    <span class="kpi-sub"
                        >{result.answered} von {result.total} bewertet</span
                    >
                </div>
                <div class="kpi">
                    <span class="kpi-label">Kriterien mit Lücke</span>
                    <div class="kpi-num">
                        {result.criteriaWithGap}<span class="kpi-unit"
                            >/ {result.answered}</span
                        >
                    </div>
                    <span class="kpi-sub">Gap &gt; 0</span>
                </div>
                <div class="kpi">
                    <span class="kpi-label">Zielerreichung</span>
                    <div class="kpi-num">
                        {result.goalAttainment === null
                            ? "–"
                            : Math.round(result.goalAttainment * 100)}<span
                            class="kpi-unit">%</span
                        >
                    </div>
                    <span class="kpi-sub">100 % = alle auf Ziel</span>
                </div>
            </div>

            <section class="card">
                <div class="card-head">
                    <h2>Ist-Reifegrad je Bewertungsbereich</h2>
                    <div class="legend">
                        <span class="lg"><i class="sw blue"></i>Ist</span>
                        <span class="lg"
                            ><i class="sw tgt"></i>Ziel ({result.targetLevel.toFixed(
                                1,
                            )})</span
                        >
                    </div>
                </div>
                <div class="areas">
                    {#each result.areas as a (a.area.id)}
                        <div class="area-row">
                            <span class="area-label">{a.area.label}</span>
                            <div class="bar">
                                {#if a.average !== null}
                                    <div
                                        class="bar-fill"
                                        class:low={a.average < 2}
                                        style="width: {pct(a.average)}%"
                                    ></div>
                                {/if}
                                <div
                                    class="bar-target"
                                    style="left: {pct(result.targetLevel)}%"
                                ></div>
                            </div>
                            <span class="area-val">{fmt(a.average)}</span>
                        </div>
                    {/each}
                </div>
            </section>

            <section class="card">
                <h2>Sozio-technische Auswertung</h2>
                <p class="hint">
                    Reife entlang der drei Wirkungsdimensionen. Zeigt, ob die
                    Lücke eher technisch, prozessual oder menschlich bedingt
                    ist.
                </p>
                <div class="socio">
                    {#each result.socio as s (s.key)}
                        <div class="socio-item">
                            <div class="socio-head">
                                <span class="socio-label">{s.label}</span>
                                <span class="socio-val">{fmt(s.average)}</span>
                            </div>
                            <div class="bar small">
                                {#if s.average !== null}
                                    <div
                                        class="bar-fill"
                                        class:low={s.average < 2}
                                        style="width: {pct(s.average)}%"
                                    ></div>
                                {/if}
                            </div>
                            <span class="socio-cap"
                                >{stageLabel(s.average)}</span
                            >
                        </div>
                    {/each}
                </div>
            </section>
        {/if}
    </main>
</div>

<style>
    .container {
        max-width: 1040px;
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
        margin: 0 0 10px;
    }
    h1 {
        font-size: 30px;
        line-height: 1.15;
        margin: 0 0 28px;
    }
    .lead {
        font-size: 16px;
        color: var(--muted);
        margin: 0 0 24px;
    }

    /* KPI-Kacheln */
    .kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 20px;
    }
    .kpi {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 20px;
    }
    .kpi-label {
        font-size: 13px;
        color: var(--muted);
    }
    .kpi-num {
        font-size: 34px;
        font-weight: 700;
        margin: 8px 0 6px;
    }
    .kpi-unit {
        font-size: 15px;
        font-weight: 400;
        color: var(--muted);
        margin-left: 4px;
    }
    .kpi-sub {
        font-size: 12px;
        color: var(--muted);
    }
    .kpi-sub.amber {
        color: var(--amber);
    }

    .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 26px;
        margin-bottom: 20px;
    }
    .card-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 20px;
    }
    .card h2 {
        font-size: 17px;
        margin: 0;
    }
    .hint {
        font-size: 13px;
        color: var(--muted);
        margin: 4px 0 20px;
    }

    /* Legende */
    .legend {
        display: flex;
        gap: 16px;
    }
    .lg {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--muted);
    }
    .sw {
        width: 12px;
        height: 12px;
        border-radius: 3px;
    }
    .sw.blue {
        background: var(--primary);
    }
    .sw.tgt {
        width: 0;
        height: 14px;
        border-left: 2px dashed var(--amber);
        border-radius: 0;
    }

    /* Balken je Bereich */
    .areas {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .area-row {
        display: grid;
        grid-template-columns: 220px 1fr 40px;
        align-items: center;
        gap: 16px;
    }
    .area-label {
        font-size: 14px;
    }
    .area-val {
        font-size: 14px;
        font-weight: 700;
        text-align: right;
    }
    .bar {
        position: relative;
        height: 22px;
        background: #eef1f5;
        border-radius: 6px;
    }
    .bar-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: var(--primary);
        border-radius: 6px;
    }
    .bar-fill.low {
        background: var(--amber);
    }
    .bar-target {
        position: absolute;
        top: -3px;
        height: 28px;
        border-left: 2px dashed var(--amber);
    }

    /* Sozio-technisch */
    .socio {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 28px;
    }
    .socio-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 8px;
    }
    .socio-label {
        font-size: 14px;
        font-weight: 600;
    }
    .socio-val {
        font-size: 14px;
        font-weight: 700;
    }
    .bar.small {
        height: 8px;
        border-radius: 999px;
    }
    .bar.small .bar-fill {
        border-radius: 999px;
    }
    .socio-cap {
        font-size: 12px;
        color: var(--muted);
        display: block;
        margin-top: 8px;
    }

    /* Buttons */
    .btn-primary {
        display: inline-flex;
        background: var(--primary);
        color: #fff;
        font-weight: 600;
        font-size: 16px;
        padding: 14px 24px;
        border: 0;
        border-radius: var(--radius);
        cursor: pointer;
        font-family: inherit;
        text-decoration: none;
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
        cursor: pointer;
        text-decoration: none;
    }
    .btn-ghost:hover:not(:disabled) {
        border-color: #c7d0dc;
    }
    .btn-ghost:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
