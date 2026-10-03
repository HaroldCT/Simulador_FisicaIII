function renderCircuitoRC(body) {
  body.innerHTML = `
    <div class="grid3">
      <div class="panel">
        <div class="panel-title">Parámetros del circuito</div>
        <div class="field">
          <label>Resistencia (R) <span class="val" id="rc-r-val">1.00 kΩ</span></label>
          <input type="range" id="rc-r" min="0.1" max="10" step="0.1" value="1">
        </div>
        <div class="field">
          <label>Capacitancia (C) <span class="val" id="rc-c-val">100 µF</span></label>
          <input type="range" id="rc-c" min="1" max="1000" step="1" value="100">
        </div>
        <div class="field">
          <label>Voltaje de la fuente (V) <span class="val" id="rc-v-val">10.0 V</span></label>
          <input type="range" id="rc-v" min="0.1" max="24" step="0.1" value="10">
        </div>
        <div class="field">
          <label>Condición inicial</label>
          <select id="rc-init">
            <option value="0">Capacitor descargado</option>
            <option value="1">Capacitor cargado</option>
          </select>
        </div>
        <div class="btn-row">
          <button class="btn green" id="rc-charge">Cargar</button>
          <button class="btn red" id="rc-discharge">Descargar</button>
        </div>
        <button class="btn secondary" id="rc-reset" style="margin-top:8px">Reiniciar</button>
      </div>

      <div class="panel">
        <div class="panel-title">Circuito</div>
        <div class="viz-box" style="min-height:160px">
          <svg id="rc-viz" width="100%" height="150" viewBox="0 0 260 150"></svg>
        </div>
        <div class="panel-title">Gráfica: Voltaje en el capacitor</div>
        <div id="rc-graph"></div>
        <div class="legend">
          <span style="color:#3b82f6"><i style="background:#3b82f6"></i> Carga</span>
          <span style="color:#8b93ad"><i style="border-top:2px dashed #8b93ad;background:none"></i> Descarga</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Valores en tiempo real</div>
        <div class="result-row"><span class="result-label">Tiempo (t)</span><span class="result-value" id="rc-t">0.00 s</span></div>
        <div class="result-row"><span class="result-label">Voltaje en C (Vc)</span><span class="result-value" id="rc-vc">0.00 V</span></div>
        <div class="result-row"><span class="result-label">Corriente (I)</span><span class="result-value" id="rc-i">0.00 mA</span></div>
        <div class="result-row"><span class="result-label">Constante de tiempo (τ)</span><span class="result-value" id="rc-tau">- s</span></div>

        <div class="panel-title" style="margin-top:14px">Ecuación</div>
        <div class="mini-formula">Carga: V_C(t)=V(1−e^(−t/RC))</div><br>
        <div class="mini-formula">Descarga: V_C(t)=V₀·e^(−t/RC)</div>
      </div>
    </div>
  `;

  const rEl = body.querySelector('#rc-r');
  const cEl = body.querySelector('#rc-c');
  const vEl = body.querySelector('#rc-v');
  const initEl = body.querySelector('#rc-init');

  let phase = 'idle'; // idle | charging | discharging
  let t = 0;
  let Vc0 = 0;
  let timer = null;

  function params() {
    const R = parseFloat(rEl.value) * 1000; // kΩ -> Ω
    const C = parseFloat(cEl.value) * 1e-6; // µF -> F
    const V = parseFloat(vEl.value);
    return { R, C, V, tau: R * C };
  }

  function currentVc() {
    const { V, tau } = params();
    if (phase === 'charging') return V + (Vc0 - V) * Math.exp(-t / tau);
    if (phase === 'discharging') return Vc0 * Math.exp(-t / tau);
    return Vc0;
  }

  function drawSchematic(vc) {
    const svgEl = body.querySelector('#rc-viz');
    svgEl.innerHTML = '';
    const add = (tag, attrs) => svgEl.appendChild(Charts.svg(tag, attrs));
    // battery
    add('line', { x1: 30, y1: 30, x2: 30, y2: 110, stroke: 'currentColor', 'stroke-width': 2 });
    add('line', { x1: 22, y1: 55, x2: 22, y2: 75, stroke: '#3b82f6', 'stroke-width': 3 });
    add('line', { x1: 30, y1: 45, x2: 30, y2: 85, stroke: '#3b82f6', 'stroke-width': 3 });
    add('text', { x: 12, y: 70, fill: 'currentColor', 'font-size': 11 }).textContent = 'V';
    // top wire with switch
    add('line', { x1: 30, y1: 30, x2: 90, y2: 30, stroke: 'currentColor', 'stroke-width': 2 });
    add('circle', { cx: 92, cy: 30, r: 2.5, fill: 'currentColor' });
    add('line', { x1: 95, y1: 30, x2: 120, y2: (phase === 'charging' ? 14 : 30), stroke: '#16a34a', 'stroke-width': 2 });
    add('circle', { cx: 122, cy: 30, r: 2.5, fill: 'currentColor' });
    add('line', { x1: 125, y1: 30, x2: 160, y2: 30, stroke: 'currentColor', 'stroke-width': 2 });
    // resistor box
    add('rect', { x: 160, y: 22, width: 46, height: 16, rx: 3, fill: 'none', stroke: '#f59e0b', 'stroke-width': 2 });
    add('text', { x: 183, y: 16, fill: 'currentColor', 'font-size': 10, 'text-anchor': 'middle' }).textContent = 'R';
    add('line', { x1: 206, y1: 30, x2: 230, y2: 30, stroke: 'currentColor', 'stroke-width': 2 });
    add('line', { x1: 230, y1: 30, x2: 230, y2: 60, stroke: 'currentColor', 'stroke-width': 2 });
    // capacitor
    add('line', { x1: 220, y1: 60, x2: 240, y2: 60, stroke: '#8b5cf6', 'stroke-width': 3 });
    add('line', { x1: 220, y1: 70, x2: 240, y2: 70, stroke: '#8b5cf6', 'stroke-width': 3 });
    add('line', { x1: 230, y1: 70, x2: 230, y2: 110, stroke: 'currentColor', 'stroke-width': 2 });
    add('text', { x: 246, y: 68, fill: 'currentColor', 'font-size': 10 }).textContent = 'C';
    add('line', { x1: 30, y1: 110, x2: 230, y2: 110, stroke: 'currentColor', 'stroke-width': 2 });
    add('text', { x: 128, y: 128, fill: '#8b5cf6', 'font-size': 11, 'text-anchor': 'middle', 'font-weight': 700 }).textContent = `Vc = ${vc.toFixed(2)} V`;
  }

  function drawGraph() {
    const { V, tau } = params();
    const tmax = Math.max(tau * 5, 0.01);
    const chargePts = [], dischargePts = [];
    for (let i = 0; i <= 60; i++) {
      const tt = (i / 60) * tmax;
      chargePts.push([tt, V * (1 - Math.exp(-tt / tau))]);
      dischargePts.push([tt, V * Math.exp(-tt / tau)]);
    }
    const vc = currentVc();
    const container = body.querySelector('#rc-graph');
    container.innerHTML = '';
    const chart = Charts.lineChart({
      width: 300, height: 170, xMin: 0, xMax: tmax, yMin: 0, yMax: V * 1.1 || 1,
      xTicks: [0, tmax * 0.2, tmax * 0.4, tmax * 0.6, tmax * 0.8, tmax].map(v => Charts.round(v, 2)),
      theme: currentTheme(),
      series: [
        { points: chargePts, color: '#3b82f6' },
        { points: dischargePts, color: '#8b93ad', dashed: true },
        { points: [[t <= tmax ? t : tmax, vc]], color: '#f59e0b', point: [t <= tmax ? t : tmax, vc] },
      ],
    });
    container.appendChild(chart);
  }

  function updateReadout() {
    const { R, tau } = params();
    const vc = currentVc();
    const i = phase === 'idle' ? 0 : (phase === 'charging' ? (params().V - vc) / R : vc / R);
    body.querySelector('#rc-t').textContent = `${t.toFixed(2)} s`;
    body.querySelector('#rc-vc').textContent = `${vc.toFixed(2)} V`;
    body.querySelector('#rc-i').textContent = `${(i * 1000).toFixed(2)} mA`;
    body.querySelector('#rc-tau').textContent = `${tau.toFixed(3)} s`;
    drawSchematic(vc);
    drawGraph();
  }

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function startPhase(newPhase) {
    stopTimer();
    Vc0 = currentVc();
    phase = newPhase;
    t = 0;
    const { tau } = params();
    const tmax = tau * 5;
    const stepsTotal = 90; // ~3s de animación
    const dt = tmax / stepsTotal;
    timer = setInterval(() => {
      t += dt;
      if (t >= tmax) {
        t = tmax;
        updateReadout();
        stopTimer();
        return;
      }
      updateReadout();
    }, 33);
    updateReadout();
  }

  body.querySelector('#rc-charge').onclick = () => startPhase('charging');
  body.querySelector('#rc-discharge').onclick = () => startPhase('discharging');
  body.querySelector('#rc-reset').onclick = () => {
    stopTimer();
    phase = 'idle';
    t = 0;
    Vc0 = initEl.value === '1' ? parseFloat(vEl.value) : 0;
    updateReadout();
  };
  initEl.onchange = () => {
    if (phase === 'idle') { Vc0 = initEl.value === '1' ? parseFloat(vEl.value) : 0; updateReadout(); }
  };

  [rEl, cEl, vEl].forEach(el => el.addEventListener('input', () => {
    body.querySelector('#rc-r-val').textContent = `${parseFloat(rEl.value).toFixed(2)} kΩ`;
    body.querySelector('#rc-c-val').textContent = `${parseFloat(cEl.value).toFixed(0)} µF`;
    body.querySelector('#rc-v-val').textContent = `${parseFloat(vEl.value).toFixed(1)} V`;
    if (phase === 'idle') updateReadout();
  }));

  body.querySelector('#rc-r-val').textContent = `${parseFloat(rEl.value).toFixed(2)} kΩ`;
  body.querySelector('#rc-c-val').textContent = `${parseFloat(cEl.value).toFixed(0)} µF`;
  body.querySelector('#rc-v-val').textContent = `${parseFloat(vEl.value).toFixed(1)} V`;

  updateReadout();

  const observer = new MutationObserver(() => {
    if (!document.body.contains(body)) { stopTimer(); observer.disconnect(); }
  });
  observer.observe(document.getElementById('view'), { childList: true, subtree: true });
}
