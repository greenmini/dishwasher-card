/*!
 * Dishwasher Card v1.0.0
 * 一体化洗碗机状态卡片：电源开关 + 进度 + 剩余时间 + 阶段/程序 + 功率/能耗
 * 用法:
 *   type: custom:dishwasher-card
 *   entity: switch.cp7_cp7_relay          (电源开关, 必填)
 *   state: sensor.washing_machine_state
 *   running: binary_sensor.washing_machine_running
 *   progress: sensor.washing_machine_progress
 *   time_remaining: sensor.washing_machine_time_remaining
 *   current_power: sensor.washing_machine_current_power
 *   phase: sensor.washing_machine_current_phase
 *   program: sensor.washing_machine_program
 *   energy: sensor.chu_fang_dishwasher_energy_total
 *   cycle_count: sensor.washing_machine_cycle_count
 *   name: 洗碗机
 */

window.customCards = window.customCards || [];

const DW_STYLE = `
  .dw-card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: 14px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0,0,0,.15));
    padding: 16px;
    color: var(--primary-text-color);
    font-family: var(--primary-font-family, inherit);
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
  }
  .dw-head { display: flex; align-items: center; gap: 12px; }
  .dw-icon {
    width: 44px; height: 44px; border-radius: 50%; flex: none;
    display: flex; align-items: center; justify-content: center;
    background: var(--dw-accent); color: #fff;
  }
  .dw-icon svg { width: 24px; height: 24px; }
  .dw-title { flex: 1; min-width: 0; }
  .dw-name { font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dw-sub { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dw-badge {
    flex: none; font-size: 12px; font-weight: 600; padding: 4px 10px;
    border-radius: 999px; color: #fff;
  }
  .dw-badge.idle { background: var(--disabled-text-color, #9e9e9e); }
  .dw-badge.running { background: var(--dw-accent); }
  .dw-badge.done { background: var(--success-color, #43a047); }
  .dw-progress { margin-top: 14px; }
  .dw-progress-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
  .dw-pct { font-size: 20px; font-weight: 700; }
  .dw-plabel { font-size: 12px; color: var(--secondary-text-color); }
  .dw-bar { height: 8px; border-radius: 4px; background: var(--divider-color, rgba(0,0,0,.12)); overflow: hidden; }
  .dw-bar-inner { height: 100%; border-radius: 4px; background: var(--dw-accent); transition: width .4s ease; }
  .dw-stats { display: flex; gap: 10px; margin-top: 14px; }
  .dw-stat {
    flex: 1; min-width: 0; background: var(--secondary-background-color, rgba(0,0,0,.05));
    border-radius: 10px; padding: 10px 12px;
  }
  .dw-stat-label { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dw-stat-value { font-size: 15px; font-weight: 600; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dw-rows { margin-top: 12px; }
  .dw-row { display: flex; align-items: center; gap: 10px; padding: 8px 2px; border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); }
  .dw-row:first-child { border-top: none; }
  .dw-row svg { width: 18px; height: 18px; color: var(--dw-accent); flex: none; }
  .dw-row-label { flex: 1; font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dw-row-value { font-size: 13px; font-weight: 500; text-align: right; }
  .dw-actions { display: flex; gap: 8px; margin-top: 14px; }
  .dw-btn {
    flex: 1; text-align: center; padding: 10px 0; border-radius: 10px;
    font-size: 13px; font-weight: 600; border: none; cursor: pointer;
    font-family: inherit;
  }
  .dw-btn.power { background: var(--dw-accent); color: #fff; }
  .dw-btn.power.off { background: var(--divider-color, rgba(0,0,0,.14)); color: var(--primary-text-color); }
  .dw-btn.info { background: var(--secondary-background-color, rgba(0,0,0,.05)); color: var(--primary-text-color); }
`;

const DW_ICONS = {
  dishwasher: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V4A2,2 0 0,0 18,2M18,20H6V16H18V20M18,15H6V8H18V15M7,6.5A1,1 0 0,1 6,5.5A1,1 0 0,1 7,4.5A1,1 0 0,1 8,5.5A1,1 0 0,1 7,6.5M10,6.5A1,1 0 0,1 9,5.5A1,1 0 0,1 10,4.5A1,1 0 0,1 11,5.5A1,1 0 0,1 10,6.5M7,13H11V10H7V13Z"/></svg>',
  timer: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15,3H9V1H15V3M13,19A7,7 0 0,0 20,12A7,7 0 0,0 13,5A7,7 0 0,0 6,12A7,7 0 0,0 13,19M13,7A5,5 0 0,1 18,12A5,5 0 0,1 13,17A5,5 0 0,1 8,12A5,5 0 0,1 13,7M12,8V13L16,15.5L16.8,14.3L13.5,12.2V8H12Z"/></svg>',
  flash: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7,2V13H10V22L17,10H13L17,2H7Z"/></svg>',
  phase: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,6V12L16,14L17,12.5L14,11V6H12Z"/></svg>',
  program: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M10,18H11V12H10V18M13,18H14V10H13V18M7,18H8V14H7V18Z"/></svg>',
  energy: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11.15,3.17L7.4,12.45C7.34,12.58 7.3,12.71 7.3,12.85C7.3,13.4 7.74,13.85 8.29,13.85H12.35L10.95,20.58C10.92,20.77 11,20.95 11.14,21.06C11.38,21.27 11.74,21.27 11.98,21.06L16.53,13.58C16.67,13.38 16.65,13.09 16.48,12.91C16.31,12.74 16.05,12.7 15.84,12.78L12.35,12.15L15.64,4.55C15.67,4.47 15.69,4.4 15.69,4.32C15.69,3.77 15.25,3.32 14.7,3.32H8.5C8.02,3.32 7.61,3.68 7.55,4.15C7.5,4.6 7.75,5.03 8.15,5.19L11.15,6.5V3.17Z"/></svg>',
  counter: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M4,6V18H20V6H4M6,9H11V15H13V9H18V7H6V9Z"/></svg>',
};

class DishwasherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._loaded = false;
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error("dishwasher-card: 需要配置 entity（电源开关实体）");
    }
    this._config = config;
    this.shadowRoot.innerHTML = `<style>${DW_STYLE}</style><div class="dw-card"></div>`;
    this._root = this.shadowRoot.querySelector(".dw-card");
    this._bind();
    this._loaded = true;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._loaded) this._render();
  }

  getCardSize() {
    return 4;
  }

  _bind() {
    this._root.addEventListener("click", (ev) => {
      if (ev.target.closest(".dw-btn.info")) {
        this._moreInfo(this._config.state || this._config.entity);
        return;
      }
      if (ev.target.closest(".dw-btn.power")) {
        this._toggle();
        return;
      }
      this._toggle();
    });
  }

  _st(key) {
    const eid = this._config[key];
    return eid ? this._hass.states[eid] : undefined;
  }

  _num(st) {
    if (!st) return null;
    const v = parseFloat(st.state);
    return isNaN(v) ? null : v;
  }

  _fmtTime(min) {
    if (min === null || isNaN(min)) return "—";
    if (min >= 60) {
      const h = Math.floor(min / 60);
      const m = Math.round(min % 60);
      return h + "小时" + (m ? m + "分" : "");
    }
    return Math.round(min) + " 分钟";
  }

  _fmtPower(w) {
    if (w === null || isNaN(w)) return "—";
    if (w >= 1000) return (w / 1000).toFixed(2) + " kW";
    return w.toFixed(0) + " W";
  }

  _isRunning() {
    const run = this._st("running");
    if (run && ["on", "true", "running", "washing"].includes(String(run.state).toLowerCase())) return true;
    const st = this._st("state");
    if (st) {
      const s = String(st.state).toLowerCase();
      if (["off", "idle", "standby", "unknown", "unavailable", "empty", "finish", "finished", "done", "clean"].includes(s)) return false;
      if (s !== "off") return true;
    }
    const power = this._num(this._st("current_power"));
    if (power !== null && power > 10) return true;
    return false;
  }

  _badge() {
    const st = this._st("state");
    const s = st ? String(st.state).toLowerCase() : "";
    if (["finish", "finished", "done", "clean"].includes(s)) return { text: "完成", cls: "done" };
    if (this._isRunning()) return { text: "运行中", cls: "running" };
    return { text: "空闲", cls: "idle" };
  }

  _render() {
    if (!this._config || !this._hass || !this._root) return;
    const cfg = this._config;
    const name = cfg.name || "洗碗机";

    const powerSt = this._st("entity");
    const powerOn = powerSt && powerSt.state === "on";
    const progressSt = this._st("progress");
    const progress = this._num(progressSt);
    const timeSt = this._st("time_remaining");
    const timeMin = this._num(timeSt);
    const powerVal = this._num(this._st("current_power"));
    const phaseSt = this._st("phase");
    const programSt = this._st("program");
    const energySt = this._st("energy");
    const cycleSt = this._st("cycle_count");

    const badge = this._badge();
    const accent = badge.cls === "running" ? "var(--success-color, #43a047)" : "var(--primary-color, #03a9f4)";
    const sub = powerOn ? "电源：开" : "电源：关";

    const rows = [];
    if (phaseSt) rows.push({ icon: "phase", label: "当前阶段", value: phaseSt.state || "—" });
    if (programSt) rows.push({ icon: "program", label: "洗涤程序", value: programSt.state || "—" });
    if (energySt) rows.push({ icon: "energy", label: "总能耗", value: energySt.state + (energySt.attributes.unit_of_measurement ? " " + energySt.attributes.unit_of_measurement : "") });
    if (cycleSt) rows.push({ icon: "counter", label: "循环次数", value: cycleSt.state || "—" });

    const rowsHtml = rows.map((r) => `
      <div class="dw-row">
        ${DW_ICONS[r.icon] || ""}
        <span class="dw-row-label">${r.label}</span>
        <span class="dw-row-value">${r.value}</span>
      </div>`).join("");

    const progressHtml = (progress !== null && progress >= 0)
      ? `<div class="dw-progress">
           <div class="dw-progress-top">
             <span class="dw-plabel">洗涤进度</span>
             <span class="dw-pct">${Math.round(progress)}%</span>
           </div>
           <div class="dw-bar"><div class="dw-bar-inner" style="width:${Math.min(100, Math.max(0, progress))}%"></div></div>
         </div>`
      : "";

    this._root.innerHTML = `
      <div style="--dw-accent:${accent}">
        <div class="dw-head">
          <div class="dw-icon">${DW_ICONS.dishwasher}</div>
          <div class="dw-title">
            <div class="dw-name">${name}</div>
            <div class="dw-sub">${sub}</div>
          </div>
          <div class="dw-badge ${badge.cls}">${badge.text}</div>
        </div>
        ${progressHtml}
        <div class="dw-stats">
          <div class="dw-stat">
            <div class="dw-stat-label">剩余时间</div>
            <div class="dw-stat-value">${this._fmtTime(timeMin)}</div>
          </div>
          <div class="dw-stat">
            <div class="dw-stat-label">当前功率</div>
            <div class="dw-stat-value">${this._fmtPower(powerVal)}</div>
          </div>
        </div>
        ${rowsHtml ? `<div class="dw-rows">${rowsHtml}</div>` : ""}
        <div class="dw-actions">
          <button class="dw-btn power ${powerOn ? "" : "off"}">${powerOn ? "关机" : "开机"}</button>
          <button class="dw-btn info">详情</button>
        </div>
      </div>`;
  }

  _toggle() {
    if (!this._config.entity) return;
    const domain = this._config.entity.split(".")[0];
    this._hass.callService(domain, "toggle", { entity_id: this._config.entity });
  }

  _moreInfo(eid) {
    if (!eid) return;
    window.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: eid } }));
  }
}

if (!customElements.get("dishwasher-card")) {
  customElements.define("dishwasher-card", DishwasherCard);
}
if (!window.customCards.some((c) => c.type === "dishwasher-card")) {
  window.customCards.push({
    type: "dishwasher-card",
    name: "洗碗机卡片",
    description: "一体化洗碗机状态卡片：电源、进度、剩余时间、阶段、能耗",
  });
}
