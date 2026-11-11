<script lang="ts">
    import { catalog } from "../../lib/catalog";
    import { assessment, setAnswer } from "../../lib/stores/assessment.svelte";
    import AppHeader from "../../lib/components/AppHeader.svelte";

    const orderedCriteria = $derived(
        catalog.areas
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .flatMap((area) =>
                catalog.criteria.filter(
                    (c) =>
                        c.areaId === area.id &&
                        assessment.scopeId !== null &&
                        c.appliesToScopes.includes(assessment.scopeId),
                ),
            ),
    );

    let currentIndex = $state(0);

    const current = $derived(orderedCriteria[currentIndex]);
    const total = $derived(orderedCriteria.length);
    const answeredCount = $derived(
        orderedCriteria.filter((c) => assessment.answers[c.id] !== undefined)
            .length,
    );
    const scopeLabel = $derived(
        catalog.scopes.find((s) => s.id === assessment.scopeId)?.label ?? "",
    );
    const areaLabel = $derived(
        current
            ? catalog.areas.find((a) => a.id === current.areaId)?.label
            : "",
    );

    const areaNav = $derived(
        catalog.areas
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .flatMap((area) => {
                const items = orderedCriteria.filter(
                    (c) => c.areaId === area.id,
                );
                if (items.length === 0) return [];
                const firstIndex = orderedCriteria.findIndex(
                    (c) => c.areaId === area.id,
                );
                const answered = items.filter(
                    (c) => assessment.answers[c.id] !== undefined,
                ).length;
                return [{ area, total: items.length, answered, firstIndex }];
            }),
    );

    const areaCriteria = $derived(
        current
            ? orderedCriteria.filter((c) => c.areaId === current.areaId)
            : [],
    );
    const positionInArea = $derived(
        current ? areaCriteria.findIndex((c) => c.id === current.id) + 1 : 0,
    );

    const chipColors = ["#cbd2dc", "#9db4e0", "#6e8fd4", "#3e66c8", "#1e40af"];
    const socioLabels: Record<string, string> = {
        technical: "technisch",
        organizational: "organisatorisch",
        human: "menschlich",
    };

    const levelOptions = $derived(
        current
            ? [0, 1, 2, 3, 4].map((n) => ({
                  value: n,
                  label:
                      catalog.maturityLevels.find((l) => l.value === n)
                          ?.label ?? String(n),
                  description:
                      current.levelDescriptions[
                          String(n) as "0" | "1" | "2" | "3" | "4"
                      ],
                  chip: chipColors[n],
              }))
            : [],
    );

    function goPrev() {
        currentIndex = Math.max(0, currentIndex - 1);
    }
    function goNext() {
        currentIndex = Math.min(total - 1, currentIndex + 1);
    }
    function jumpToArea(firstIndex: number) {
        currentIndex = firstIndex;
    }
</script>

<svelte:head><title>ZT-MTM Assessment</title></svelte:head>

<div class="page">
    <AppHeader />

    {#if !assessment.scopeId}
        <main class="guard">
            <p class="step">Schritt 2 von 4 Assessment</p>
            <h1>Kein Geltungsbereich gewählt</h1>
            <p class="lead">
                Bitte wähle zuerst auf der Einrichtungsseite einen
                Geltungsbereich.
            </p>
            <a href="/">← Zur Einrichtung</a>
        </main>
    {:else}
        <div class="top-actions">
            <a href="/" class="btn-ghost sm">← Zur Startseite</a>
        </div>
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

        <div class="layout">
            <aside class="sidebar">
                <p class="sidebar-title">Bewertungsbereiche</p>
                {#each areaNav as nav (nav.area.id)}
                    <button
                        type="button"
                        class="nav-item"
                        class:active={current?.areaId === nav.area.id}
                        onclick={() => jumpToArea(nav.firstIndex)}
                    >
                        <span
                            class="dot"
                            class:done={nav.answered === nav.total}
                            class:partial={nav.answered > 0 &&
                                nav.answered < nav.total}
                        ></span>
                        <span class="nav-label">{nav.area.label}</span>
                        <span class="nav-count mono"
                            >{nav.answered}/{nav.total}</span
                        >
                    </button>
                {/each}
            </aside>

            <main class="main">
                {#if current}
                    <p class="crumb">
                        {current.id} | {areaLabel} | Kriterium {positionInArea} von
                        {areaCriteria.length}
                    </p>
                    <h1 class="question">{current.question}</h1>

                    <div class="badges">
                        <span class="badge weight"
                            >Gewicht {current.weight}</span
                        >
                        {#each current.socioTechnical as dim (dim)}
                            <span class="badge">{socioLabels[dim]}</span>
                        {/each}
                    </div>

                    <p class="label">Ist-Reifegrad auswählen</p>
                    <div class="options">
                        {#each levelOptions as opt (opt.value)}
                            <button
                                type="button"
                                class="option"
                                class:selected={assessment.answers[
                                    current.id
                                ] === opt.value}
                                aria-pressed={assessment.answers[current.id] ===
                                    opt.value}
                                onclick={() => setAnswer(current.id, opt.value)}
                            >
                                <span
                                    class="chip mono"
                                    style="background: {opt.chip}"
                                    >{opt.value}</span
                                >
                                <span class="opt-text">
                                    <span class="opt-title">{opt.label}</span>
                                    <span class="opt-desc"
                                        >{opt.description}</span
                                    >
                                </span>
                            </button>
                        {/each}

                        <button
                            type="button"
                            class="option"
                            class:selected={assessment.answers[current.id] ===
                                "N/A"}
                            aria-pressed={assessment.answers[current.id] ===
                                "N/A"}
                            onclick={() => setAnswer(current.id, "N/A")}
                        >
                            <span class="chip na mono">N/A</span>
                            <span class="opt-text">
                                <span class="opt-title">nicht anwendbar</span>
                                <span class="opt-desc"
                                    >Kriterium ist im Bewertungsumfang fachlich
                                    nicht relevant</span
                                >
                            </span>
                        </button>
                    </div>

                    <div class="nav">
						<button
							type="button"
							class="btn-ghost"
							onclick={goPrev}
							disabled={currentIndex === 0}
						>
							Zurück
						</button>
						<div class="nav-right">
							{#if currentIndex === total - 1}
								<a href="/results" class="btn-primary">Auswertung ansehen</a>
							{:else}
								<a href="/results" class="btn-ghost">Auswertung ansehen</a>
								<button type="button" class="btn-primary" onclick={goNext}>
									Weiter
								</button>
							{/if}
						</div>
					</div>
                {/if}
            </main>
        </div>
    {/if}
</div>

<style>
    .page {
        max-width: 1080px;
        margin: 0 auto;
        padding: 0 24px 64px;
    }
    .guard {
        padding-top: 40px;
    }
    .step {
        font-size: 12px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-weight: 600;
    }

    .progress {
        padding: 20px 0 18px;
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

    .layout {
        display: flex;
        gap: 32px;
        align-items: flex-start;
    }
    .sidebar {
        width: 280px;
        flex: none;
        position: sticky;
        top: 20px;
    }
    .sidebar-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--muted);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        margin: 0 0 12px;
    }
    .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        text-align: left;
        border: 0;
        background: none;
        border-radius: 9px;
        padding: 10px 12px;
        cursor: pointer;
        font-family: inherit;
    }
    .nav-item:hover {
        background: #f0f2f5;
    }
    .nav-item.active {
        background: var(--primary-soft);
    }
    .nav-item.active .nav-label {
        color: var(--primary);
        font-weight: 600;
    }
    .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        flex: none;
        background: #cbd2dc;
    }
    .dot.partial {
        background: var(--primary);
    }
    .dot.done {
        background: var(--teal);
    }
    .nav-label {
        flex: 1;
        font-size: 14px;
        color: var(--ink);
    }
    .nav-count {
        font-size: 12px;
        color: var(--muted);
    }

    .main {
        flex: 1;
        min-width: 0;
        padding-top: 4px;
    }
    .question {
        font-size: 23px;
        line-height: 1.3;
        margin: 0 0 16px;
    }
    .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 26px;
    }
    .badge {
        font-size: 12px;
        background: #eef1f5;
        color: var(--muted);
        border-radius: 999px;
        padding: 5px 12px;
    }
    .badge.weight {
        color: var(--teal);
        font-weight: 600;
    }
    .label {
        font-size: 15px;
        font-weight: 600;
        margin: 0 0 12px;
    }
    .options {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .option {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        text-align: left;
        width: 100%;
        border: 1px solid var(--border);
        background: var(--surface);
        border-radius: var(--radius);
        padding: 14px 16px;
        cursor: pointer;
        font-family: inherit;
    }
    .option:hover {
        border-color: #c7d0dc;
    }
    .option.selected {
        border: 2px solid var(--primary);
        background: var(--primary-soft);
        padding: 13px 15px;
    }
    .chip {
        width: 34px;
        height: 34px;
        flex: none;
        border-radius: 8px;
        color: #fff;
        font-weight: 600;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .chip.na {
        background: #9aa3b0;
        font-size: 13px;
    }
    .opt-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .opt-title {
        font-weight: 600;
        font-size: 15px;
    }
    .opt-desc {
        font-size: 13px;
        color: var(--muted);
        line-height: 1.45;
    }
    .nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 28px;
        padding-top: 22px;
        border-top: 1px solid var(--border);
    }
    .btn-ghost,
    .btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        line-height: 1;
        font-size: 15px;
        font-family: inherit;
        border-radius: var(--radius);
        cursor: pointer;
        text-decoration: none;
    }
    .btn-ghost {
        background: none;
        border: 1px solid var(--border);
        padding: 12px 20px;
        color: var(--ink);
    }
    .btn-primary {
        background: var(--primary);
        color: #fff;
        border: 0;
        padding: 12px 24px;
        font-weight: 600;
    }
    .btn-ghost.sm {
        padding: 8px 14px;
        font-size: 14px;
    }
    .top-actions {
        display: flex;
        gap: 10px;
        padding-top: 16px;
    }
    .btn-ghost:disabled,
    .btn-primary:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
    h1 {
        margin: 0;
    }
    .crumb {
        color: var(--primary);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin: 0 0 12px;
    }
</style>
