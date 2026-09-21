// dm-garbage-card: card per la raccolta differenziata (Home Assistant)
// Autore: Simonz82 - https://github.com/Simonz82/ha_garbage
//
// Mostra un'immagine dinamica in base al rifiuto del giorno, il giorno del ritiro e l'orario
// in cui esporre i bidoni. Si puo' mostrare in due layout (classico / centrato), scelto dalla
// prima riga delle Impostazioni con `layout_entity`. Autoconsistente: solo questo file.
//
// Impostazioni (ingranaggio in alto a destra): di default apre una finestra nativa che elenca
// le entita' passate in `settings_sections` (nessuna dipendenza extra). Se invece usi gia'
// browser_mod e preferisci il suo popup, passa `legacy_settings_popup` (vedi README).

const CHIP_SVGS = {
  garbage:
    '<svg viewBox="0 0 96 96" width="27" height="27"><path fill="#0f2942" d="M30 30h36l-4 50a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6l-4-50z"/><rect x="26" y="22" width="44" height="8" rx="3" fill="#0f2942"/><rect x="40" y="12" width="16" height="8" rx="2" fill="#0f2942"/><path fill="#22c55e" d="M48 38c-5 4-8 8-8 12a8 8 0 0 0 16 0c0-2-.5-4-1.5-6 0 2-1.5 3.5-3 3-1.5-.5-1.5-3.5-.5-5.5-2 .5-3 1.5-3 1.5z"/></svg>',
};

const ICON_GEAR =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
const ICON_TIMER =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/></svg>';
const ICON_TREND =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 6h6v6"/></svg>';
const ICON_CALENDAR =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>';
const ICON_MEGAPHONE =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l3.5 4.5V5.5L6 10H4a1 1 0 0 0-1 1z"/><path d="M13 8a3 3 0 0 1 0 8"/><path d="M16 5.5a6.5 6.5 0 0 1 0 13"/></svg>';

// Icone per le righe "gruppo" del dialog Impostazioni (stile vecchia card).
const STYLE = `
:host{display:block;--dm-blue:#0ea5e9;--dm-blue-deep:#0369a1;--dm-dim:var(--secondary-text-color,#64748b);--dm-card:var(--card-background-color,#ffffff);--dm-border:var(--divider-color,#e6ecf4);--dm-soft:rgba(148,163,184,.10);--dm-text:var(--primary-text-color,#0f172a)}
.dm-ap-card{position:relative;display:flex;flex-direction:column;border:1px solid var(--dm-border);border-radius:22px;background:var(--dm-card);box-shadow:0 12px 30px rgba(15,23,42,.06);overflow:hidden}
.dm-ap-card.is-run{border-color:rgba(34,197,94,.28)}
.dm-ap-card.has-alarm{border-color:rgba(239,68,68,.4)}
.dm-ap-top{display:flex;align-items:center;gap:7px;padding:12px 12px 9px}
.dm-ap-chip{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:11px;background:#eff6ff;box-shadow:inset 0 0 0 1px rgba(59,130,246,.10)}
.dm-ap-chip svg{width:27px;height:27px}
.dm-ap-headings{display:flex;flex-direction:column;min-width:0;flex:1;gap:1px}
.dm-ap-name{font-size:14.5px;font-weight:900;letter-spacing:-.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dm-text)}
.dm-ap-room{font-size:11px;font-weight:750;color:var(--dm-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dm-ap-badge{display:inline-flex;align-items:center;gap:4px;flex:0 0 auto;padding:4px 7px;border-radius:999px;font-size:9.5px;font-weight:900;letter-spacing:.4px;text-transform:uppercase;white-space:nowrap}
.dm-ap-badge.run{background:#dcfce7;color:#15803d}
.dm-ap-badge.standby{background:#dbeafe;color:#2563eb}
.dm-ap-badge.off{background:#f1f5f9;color:#64748b}
.dm-ap-badge.unavailable{background:#fee2e2;color:#b91c1c}
[data-theme-dark] .dm-ap-badge.off,:host-context([data-theme="dark"]) .dm-ap-badge.off{background:rgba(148,163,184,.16);color:#94a3b8}
.dm-ap-dot{width:7px;height:7px;border-radius:50%;background:currentColor}
.dm-ap-tools{display:flex;gap:4px;flex:0 0 auto}
.dm-ap-tool{width:37px;height:37px;display:grid;place-items:center;border:1px solid var(--dm-border);border-radius:11px;background:var(--dm-card);color:var(--dm-dim);cursor:pointer}
.dm-ap-tool svg{width:19px;height:19px}
.dm-ap-tool:hover{border-color:#bae6fd;color:var(--dm-blue-deep)}
.dm-ap-top-row{display:flex;align-items:stretch;gap:10px;margin:0 13px}
.dm-ap-hero{position:relative;flex:1 1 50%;min-width:0;display:grid;place-items:center;height:182px;margin:0;border-radius:18px;background:radial-gradient(120% 90% at 50% 8%,rgba(224,242,254,.65),rgba(241,245,249,.35) 60%,transparent);overflow:hidden}
.dm-ap-card.is-run .dm-ap-hero{background:radial-gradient(120% 90% at 50% 8%,rgba(186,230,253,.85),rgba(224,242,254,.35) 62%,transparent)}
.dm-ap-hero svg{width:100%;height:100%;display:block}
.dm-ap-card.is-off .dm-ap-hero,.dm-ap-card.is-unavailable .dm-ap-hero{filter:grayscale(.55) opacity(.62)}
.dm-ap-card.is-standby .dm-ap-hero{filter:saturate(.85)}
@keyframes dmh-spin{to{transform:rotate(360deg)}}
@keyframes dmh-glow{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes dmh-flicker{0%,100%{opacity:.85}30%{opacity:.5}55%{opacity:1}80%{opacity:.6}}
.dmh-spin-drum,.dmh-spin-spray,.dmh-spin-spit{transform-box:view-box;transform-origin:120px 130px}
/* Layout "centrato" della card energia: foto al centro in alto, sotto il blocco OGGI su 2 colonne */
.dm-ap-card.layout-centrato .dm-ap-top-row{flex-direction:column;align-items:stretch;gap:10px}
.dm-ap-card.layout-centrato .dm-ap-hero{flex:0 0 auto;width:100%;height:200px}
.dm-ap-card.layout-centrato .dm-ap-cycle-side{flex:0 0 auto}
.dm-ap-card.layout-centrato .dm-ap-cycle-cap{margin-bottom:10px}
.dm-ap-card.layout-centrato .dm-ap-cycle-list{display:grid;grid-template-columns:1fr 1fr;gap:6px 8px;flex:0 0 auto}
.dm-ap-card.layout-centrato.dm-e-card .dm-ap-cycle-list{grid-template-columns:2fr 3fr}
.dm-ap-card.layout-centrato .dm-ap-cycle-list>.dm-ap-cycle-row:last-child:nth-child(odd){grid-column:1/-1}
.dm-ap-select{max-width:62%;padding:7px 10px;border-radius:10px;border:1px solid var(--dm-border);background:var(--dm-card);color:var(--dm-text);font-size:14px;font-weight:600;font-family:inherit}
.dm-ap-card.is-run .dmh-spin-drum{animation:dmh-spin 2.6s linear infinite}
.dm-ap-card.is-run .dmh-spin-spray{animation:dmh-spin 1.3s linear infinite}
.dm-ap-card.is-run .dmh-spin-spit{animation:dmh-spin 3.4s linear infinite}
.dm-ap-card.is-run .dmh-glow{animation:dmh-glow 1.7s ease-in-out infinite}
.dm-ap-card.is-run .dmh-flicker{animation:dmh-flicker 1.5s ease-in-out infinite}
.dm-ap-cycle-side{flex:1 1 50%;min-width:0;display:flex;flex-direction:column;padding:11px 13px;border-radius:16px;background:var(--dm-soft)}
.dm-ap-cycle-cap{display:flex;align-items:center;gap:6px;margin-top:-3px;margin-bottom:15px;font-size:11px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase;color:var(--dm-dim)}
.dm-ap-cycle-list{display:flex;flex-direction:column;flex:1;justify-content:flex-start;gap:4px}
.dm-ap-cycle-row{display:flex;align-items:baseline;justify-content:space-between;gap:8px;min-width:0}
.dm-ap-cycle-row small{flex:0 0 auto;font-size:10.5px;font-weight:900;letter-spacing:.7px;text-transform:uppercase;color:var(--dm-dim)}
.dm-ap-cycle-row b{min-width:0;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13.5px;font-weight:400;letter-spacing:-.1px;color:var(--dm-text)}
.dm-ap-cycle-row b.dm-e-top{display:flex;justify-content:flex-end;overflow:hidden;text-overflow:clip}
.dm-e-top-n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dm-e-top-w{flex:0 0 auto;white-space:nowrap}
.dm-ap-cycle-row-b{padding:4px 8px;border-radius:9px;border:1px solid var(--dm-border);background:var(--dm-card);align-items:center}
.dm-ap-cycle-label{display:flex;align-items:center;gap:5px;min-width:0;flex:0 0 auto}
.dm-ap-cycle-ic{display:flex;align-items:center;flex:0 0 auto;color:var(--dm-blue)}
.dm-ap-panel{display:flex;align-items:center;gap:14px;margin:10px 13px 13px;padding:13px 14px;border-radius:16px;background:var(--dm-soft)}
.dm-ap-meters{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
.dm-c-meter-clickable{cursor:pointer;border-radius:8px;transition:background .12s ease}
.dm-c-meter-clickable:active{background:rgba(148,163,184,.18)}
.dm-ap-meter-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.dm-ap-meter-row span{font-size:13px;font-weight:750;color:var(--dm-dim)}
.dm-ap-meter-row strong{font-size:16px;font-weight:950;letter-spacing:-.2px;color:var(--dm-text)}
.dm-ap-bar{position:relative;display:flex;align-items:center;height:8px;margin-top:7px}
.dm-ap-bar::before{content:"";position:absolute;inset:0;border-radius:999px;background:rgba(148,163,184,.22)}
.dm-ap-bar i{position:relative;z-index:1;display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#fb923c,#ef4444);min-width:0;transition:width .6s cubic-bezier(.4,0,.2,1)}
.dm-ap-bar i.dm-ap-progress-bar{background:linear-gradient(90deg,#4ade80,#16a34a)}
.dm-ap-power-open{cursor:pointer}
.dm-ap-power-open:hover{filter:brightness(1.04)}
.dm-ap-chart-svg{width:100%;height:100px;display:block}
.dm-ap-chart-svg.dm-e-chart-tall{height:200px}
.dm-ap-chart-labels{display:flex;justify-content:space-between;margin-top:4px;font-size:10px;font-weight:800;color:var(--dm-dim)}
.dm-ap-chart-labels span{flex:1;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dm-ap-chart-empty{padding:20px;text-align:center;font-size:13px;font-weight:700;color:var(--dm-dim)}
.dm-ap-chart-loading{padding:20px;text-align:center;font-size:13px;font-weight:700;color:var(--dm-dim)}
.dm-ap-warn{display:flex;align-items:center;gap:6px;margin:0 13px 12px;padding:9px 12px;border-radius:13px;background:#fee2e2;color:#b91c1c;font-size:13px;font-weight:800}
.dm-ap-warn[hidden]{display:none}
.dm-test-flag{position:absolute;top:10px;right:10px;z-index:2;font-size:11px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:rgba(14,165,233,.14);border-radius:8px;padding:4px 8px}

.dm-ap-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(6px)}
.dm-ap-overlay[hidden]{display:none}
.dm-ap-dialog{width:min(440px,100%);max-height:min(84vh,720px);overflow:auto;background:var(--dm-card);color:var(--dm-text);border:1px solid var(--dm-border);border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,.3)}
.dm-ap-dialog-head{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 10px;background:var(--dm-card);border-bottom:1px solid var(--dm-border);z-index:1}
.dm-ap-dialog-head h3{margin:0;font-size:17px;font-weight:900}
.dm-ap-dialog-close{width:30px;height:30px;flex:0 0 auto;display:grid;place-items:center;border:0;border-radius:10px;background:var(--dm-soft);color:var(--dm-dim);cursor:pointer}
.dm-ap-dialog-body{padding:12px 16px 18px;display:flex;flex-direction:column;gap:16px}
.dm-ap-sec-cap{font-size:11.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:var(--dm-blue-deep);margin:0 0 8px;padding-bottom:5px;border-bottom:2px solid var(--dm-border)}
.dm-ap-sec{display:flex;flex-direction:column;gap:6px}
.dm-ap-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border-radius:13px;background:var(--dm-soft)}
.dm-ap-row-label{font-size:14.5px;font-weight:750;color:var(--dm-text)}
.dm-ap-row-val{font-size:14.5px;font-weight:500;color:var(--dm-dim)}
.dm-ap-switch{position:relative;width:38px;height:22px;flex:0 0 auto;border-radius:999px;border:0;background:#cbd5e1;cursor:pointer;transition:background .15s ease}
.dm-ap-switch::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s ease;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.dm-ap-switch.on{background:#22c55e}
.dm-ap-row-group{display:flex;flex-direction:column;gap:9px;padding:10px 12px;border-radius:13px;background:var(--dm-soft)}
.dm-ap-row-group-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.dm-ap-row-group-label{display:flex;align-items:center;gap:8px;min-width:0;font-size:14.5px;font-weight:750;color:var(--dm-text)}
.dm-ap-row-group-ic{flex:0 0 auto;display:flex;align-items:center;color:var(--dm-blue)}
.dm-ap-row-chips{display:flex;flex-wrap:wrap;gap:6px}
.dm-ap-chip{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;letter-spacing:.2px;padding:5px 10px;border-radius:999px;background:var(--dm-card);border:1px solid var(--dm-border);color:var(--dm-dim);cursor:pointer;line-height:1}
.dm-ap-chip svg{flex:0 0 auto}
.dm-ap-chip b{color:var(--dm-text);font-weight:800}
.dm-ap-chip.on{background:#dcfce7;border-color:#86efac;color:#15803d}
.dm-ap-chip-action{background:var(--dm-blue);border-color:var(--dm-blue);color:#fff}
.dm-ap-sub-back{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:800;color:var(--dm-blue);cursor:pointer;margin:0 0 10px}
.dm-ap-switch.on::after{transform:translateX(16px)}
.dm-ap-action-btn{flex:0 0 auto;border:0;border-radius:10px;padding:0 14px;height:26px;background:var(--dm-blue);color:#fff;font-size:13px;font-weight:850;cursor:pointer}
.dm-ap-action-btn:active{filter:brightness(.92)}
.dm-ap-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.dm-ap-stat-grid.cols4{grid-template-columns:repeat(4,1fr)}
.dm-ap-stat{display:flex;flex-direction:column;gap:2px;padding:9px 10px;border-radius:13px;background:var(--dm-soft)}
.dm-ap-stat small{font-size:10px;font-weight:900;letter-spacing:.6px;text-transform:uppercase;color:var(--dm-dim)}
.dm-ap-stat b{font-size:15px;font-weight:900;color:var(--dm-text)}
.dm-ap-week-list{display:flex;flex-direction:column;gap:7px}
.dm-ap-week-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--dm-border)}
.dm-ap-week-row:last-child{border-bottom:0}
.dm-ap-week-day{flex:0 0 60px;font-size:13px;font-weight:850;color:var(--dm-text)}
.dm-ap-week-stats{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;min-width:0}
.dm-ap-week-stats.cols3{grid-template-columns:repeat(3,1fr)}
.dm-ap-week-stat{display:flex;flex-direction:column;align-items:center;gap:0;min-width:0}
.dm-ap-week-stat small{font-size:9px;font-weight:900;letter-spacing:.4px;text-transform:uppercase;color:var(--dm-dim)}
.dm-ap-week-stat b{font-size:13px;font-weight:850;color:var(--dm-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.dm-ap-hero{cursor:pointer}
.dm-ap-reset-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:10px;border:0;border-radius:13px;background:var(--dm-blue);color:#fff;font-size:14px;font-weight:850;cursor:pointer}
.dm-ap-reset-note{font-size:12px;color:var(--dm-dim);text-align:center;margin-top:4px}

@media (max-width:600px){
  .dm-ap-overlay{align-items:flex-end;padding:0;backdrop-filter:blur(4px)}
  .dm-ap-dialog{width:100%;max-width:100%;height:94vh;max-height:94vh;border-radius:22px 22px 0 0;display:flex;flex-direction:column}
  .dm-ap-dialog-body{flex:1}
}
`;

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function applyLayoutChoice(root, cfg, hass) {
  const card = root && root.querySelector(".dm-ap-card");
  if (!card) return;
  let layout = cfg.layout;
  if (cfg.layout_entity) {
    const v = String(hass.states[cfg.layout_entity]?.state || "").toLowerCase();
    if (v === "classico" || v === "centrato") layout = v;
  }
  card.classList.toggle("layout-centrato", layout === "centrato");
}

class DmGarbageCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error("entity è obbligatorio");
    this._config = {
      name: "Raccolta Differenziata",
      artwork: "garbage",
      state_images: {},
      settings_sections: [],
      actions: [],
      ...config,
    };
    this._root = this._root || this.attachShadow({ mode: "open" });
    const chip = CHIP_SVGS[this._config.artwork] || CHIP_SVGS.garbage;
    // Il pulsante megafono compare solo se imposti alexa_settings_path (es. "/lovelace/notifiche-alexa").
    const alexaBtn = this._config.alexa_settings_path
      ? `<button type="button" class="dm-ap-tool dm-ap-alexa" title="Notifiche Alexa">${ICON_MEGAPHONE}</button>`
      : "";
    this._root.innerHTML = `<style>${STYLE}</style>
      <article class="dm-ap-card">
        <div class="dm-ap-top">
          <span class="dm-ap-chip">${chip}</span>
          <span class="dm-ap-headings">
            <span class="dm-ap-name"></span>
          </span>
          <span class="dm-ap-badge"><i class="dm-ap-dot"></i><span class="dm-ap-badge-label"></span></span>
          <span class="dm-ap-tools">
            ${alexaBtn}
            <button type="button" class="dm-ap-tool dm-ap-settings" title="Impostazioni">${ICON_GEAR}</button>
          </span>
        </div>
        <div class="dm-ap-top-row" style="padding-bottom:10px">
          <div class="dm-ap-hero" style="display:flex;align-items:center;justify-content:center;overflow:visible">
            <img class="dm-c-garbage-img" style="width:100%;height:100%;object-fit:contain;transform:scale(0.95) translateY(-5px)" alt="">
          </div>
          <div class="dm-ap-cycle-side">
            <span class="dm-ap-cycle-cap">Info</span>
            <div class="dm-ap-cycle-list">
              <div class="dm-ap-cycle-row dm-ap-cycle-row-b"><span class="dm-ap-cycle-label"><span class="dm-ap-cycle-ic">${ICON_CALENDAR}</span><small>Oggi è</small></span><b class="dm-c-weekday">—</b></div>
              <div class="dm-ap-cycle-row dm-ap-cycle-row-b"><span class="dm-ap-cycle-label"><span class="dm-ap-cycle-ic">${ICON_TIMER}</span><small>Esporre dalle</small></span><b class="dm-c-exposetime">—</b></div>
              <div class="dm-ap-cycle-row dm-ap-cycle-row-b"><span class="dm-ap-cycle-label"><span class="dm-ap-cycle-ic">${ICON_TREND}</span><small>Giorno del ritiro</small></span><b class="dm-c-pickupday">—</b></div>
            </div>
          </div>
        </div>
        <div class="dm-ap-warn" hidden></div>
      </article>`;
    this._root.querySelector(".dm-ap-name").textContent = this._config.name;
    this._root.querySelector(".dm-ap-settings").addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._config.legacy_settings_popup) {
        const event = new Event("ll-custom", { bubbles: true, composed: true });
        event.detail = { browser_mod: this._config.legacy_settings_popup };
        this.dispatchEvent(event);
      } else {
        this._openSettings();
      }
    });
    const alexaEl = this._root.querySelector(".dm-ap-alexa");
    if (alexaEl) {
      alexaEl.addEventListener("click", (e) => {
        e.stopPropagation();
        history.pushState(null, "", this._config.alexa_settings_path);
        window.dispatchEvent(new CustomEvent("location-changed", { bubbles: true, composed: true }));
      });
    }
    this._root.querySelector(".dm-ap-hero").addEventListener("click", () => {
      const e = new Event("hass-more-info", { bubbles: true, composed: true });
      e.detail = { entityId: this._config.entity };
      this.dispatchEvent(e);
    });
  }

  _row(label, valueHtml) {
    return `<div class="dm-ap-row"><span class="dm-ap-row-label">${esc(label)}</span>${valueHtml}</div>`;
  }

  _openDialog(title, bodyHtml) {
    let overlay = this._root.querySelector(".dm-ap-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "dm-ap-overlay";
      overlay.hidden = true;
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.hidden = true;
      });
      // Menu a tendina delle impostazioni (righe input_select): la scelta viene applicata subito.
      overlay.addEventListener("change", (e) => {
        const t = e.target;
        if (t && t.dataset && t.dataset.selectEntity && this._hass) {
          this._hass.callService("input_select", "select_option", { entity_id: t.dataset.selectEntity, option: t.value });
        }
      });
      this._root.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="dm-ap-dialog">
      <div class="dm-ap-dialog-head"><h3>${esc(title)}</h3><button type="button" class="dm-ap-dialog-close">${ICON_CLOSE}</button></div>
      <div class="dm-ap-dialog-body">${bodyHtml}</div>
    </div>`;
    overlay.querySelector(".dm-ap-dialog-close").addEventListener("click", () => {
      overlay.hidden = true;
    });
    overlay.hidden = false;
    return overlay;
  }

  _settingsRowHtml(hass, row) {
    const st = hass.states[row.entity];
    if (!st) return this._row(row.label, `<span class="dm-ap-row-val">n/d</span>`);
    const domain = row.entity.split(".")[0];
    if (["input_boolean", "automation", "switch"].includes(domain)) {
      const on = st.state === "on";
      return this._row(
        row.label,
        `<button type="button" class="dm-ap-switch${on ? " on" : ""}" data-entity="${esc(row.entity)}" aria-pressed="${on}"></button>`,
      );
    }
    if (domain === "input_select") {
      const opts = (st.attributes?.options || [])
        .map((o) => `<option value="${esc(o)}"${o === st.state ? " selected" : ""}>${esc(o)}</option>`)
        .join("");
      return this._row(row.label, `<select class="dm-ap-select" data-select-entity="${esc(row.entity)}">${opts}</select>`);
    }
    const unit = st.attributes?.unit_of_measurement || "";
    return `<div class="dm-ap-row" data-open-entity="${esc(row.entity)}" style="cursor:pointer">
      <span class="dm-ap-row-label">${esc(row.label)}</span>
      <span class="dm-ap-row-val">${esc(st.state)}${unit ? " " + esc(unit) : ""}</span>
    </div>`;
  }

  _actionRowHtml(row) {
    return `<div class="dm-ap-row">
      <span class="dm-ap-row-label">${esc(row.label)}</span>
      <button type="button" class="dm-ap-action-btn" data-action-entity="${esc(row.entity)}" data-confirm="${esc(row.confirm || "")}">Esegui</button>
    </div>`;
  }

  _openSettings() {
    const hass = this._hass;
    const sections = (this._config.settings_sections || [])
      .map(
        (sec) => `<div class="dm-ap-sec">
          <div class="dm-ap-sec-cap">${esc(sec.title)}</div>
          ${sec.rows.map((row) => this._settingsRowHtml(hass, row)).join("")}
        </div>`,
      )
      .join("");

    const actions = this._config.actions || [];
    const actionsHtml = actions.length
      ? `<div class="dm-ap-sec">
           <div class="dm-ap-sec-cap">Strumenti</div>
           ${actions.map((a) => this._actionRowHtml(a)).join("")}
         </div>`
      : "";

    const overlay = this._openDialog("Impostazioni", `${sections}${actionsHtml}`);

    overlay.querySelectorAll("[data-entity]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const entity = btn.dataset.entity;
        const domain = entity.split(".")[0];
        hass.callService(domain, "toggle", { entity_id: entity });
        setTimeout(() => this._openSettings(), 200);
      });
    });
    overlay.querySelectorAll("[data-open-entity]").forEach((row) => {
      row.addEventListener("click", () => {
        const e = new Event("hass-more-info", { bubbles: true, composed: true });
        e.detail = { entityId: row.dataset.openEntity };
        this.dispatchEvent(e);
      });
    });
    overlay.querySelectorAll("[data-action-entity]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const confirmText = btn.dataset.confirm;
        if (confirmText && !window.confirm(confirmText)) return;
        hass.callService("script", "turn_on", { entity_id: btn.dataset.actionEntity });
      });
    });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    applyLayoutChoice(this._root, this._config, hass);
    const cfg = this._config;

    const st = hass.states[cfg.entity];
    const state = st?.state;

    const badge = this._root.querySelector(".dm-ap-badge");
    badge.classList.remove("run", "standby", "off", "unavailable");
    const nothingDue = !state || state === "Nulla" || state === "unknown" || state === "unavailable";
    badge.classList.add(nothingDue ? "off" : "run");
    this._root.querySelector(".dm-ap-badge-label").textContent = state || "N/D";

    const img = this._root.querySelector(".dm-c-garbage-img");
    const imgUrl = (cfg.state_images || {})[state] || (cfg.state_images || {}).Nulla || "";
    if (img.getAttribute("data-src") !== imgUrl) {
      img.src = imgUrl;
      img.setAttribute("data-src", imgUrl);
    }

    if (cfg.weekday_entity) {
      this._root.querySelector(".dm-c-weekday").textContent = hass.states[cfg.weekday_entity]?.state ?? "—";
    }
    if (cfg.expose_time_entity) {
      const t = hass.states[cfg.expose_time_entity]?.state;
      this._root.querySelector(".dm-c-exposetime").textContent = t ? t.slice(0, 5) : "—";
    }
    if (cfg.pickup_day_entity) {
      this._root.querySelector(".dm-c-pickupday").textContent = hass.states[cfg.pickup_day_entity]?.state ?? "—";
    }
  }

  getCardSize() {
    return 5;
  }
}


customElements.define("dm-garbage-card", DmGarbageCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "dm-garbage-card",
  name: "Raccolta Differenziata",
  description: "Card per la raccolta differenziata: immagine dinamica in base al rifiuto del giorno, giorno del ritiro, orario di esposizione",
  preview: false,
  documentationURL: "https://github.com/Simonz82/ha_garbage",
  author: "Simonz82",
});
