function renderMotores(body) {
  body.innerHTML = `
    <div class="grid3">
      <div class="panel">
        <div class="panel-title">Parámetros</div>
        <div class="field">
          <label>Número de espiras (N) <span class="val" id="mt-n-val">20</span></label>
          <input type="range" id="mt-n" min="1" max="200" step="1" value="20">
        </div>
        <div class="field">
          <label>Corriente (I) <span class="val" id="mt-i-val">2.00 A</span></label>
          <input type="range" id="mt-i" min="-10" max="10" step="0.1" value="2">
        </div>
        <div class="field">
          <label>Área de la espira (A) <span class="val" id="mt-a-val">50 cm²</span></label>
          <input type="range" id="mt-a" min="1" max="200" step="1" value="50">
        </div>
        <div class="field">
          <label>Campo magnético (B) <span class="val" id="mt-b-val">0.50 T</span></label>
          <input type="range" id="mt-b" min="0.1" max="2" step="0.05" value="0.5">
        </div>
        <div class="field">
          <label>Ángulo (θ) <span class="val" id="mt-t-val">90°</span></label>
          <input type="range" id="mt-theta" min="0" max="180" step="1" value="90">
        </div>
        <button class="btn secondary" id="mt-spin">Girar automáticamente</button>
      </div>

      <div class="panel">
        <div class="panel-title">Espira en el motor</div>
        <div class="viz-box"><svg id="mt-viz" width="100%" height="200" viewBox="0 0 260 200"></svg></div>
        <div class="panel-title">Gráfica: Torque vs. Ángulo</div>
        <div id="mt-graph"></div>
      </div>

      <div class="panel">
        <div class="panel-title">Resultados</div>
        <div class="formula-box">τ = N I A B sen θ</div>
        <div class="result-row"><span class="result-label">Torque (magnitud)</span></div>
        <div class="result-value big" id="mt-torque">0 N·m</div>
        <div class="result-row" style="margin-top:10px"><span class="result-label">Sentido de giro</span><span class="result-value" id="mt-dir">-</span></div>
        <div class="result-row"><span class="result-label">Momento magnético (μ=NIA)</span><span class="result-value" id="mt-mu">-</span></div>
        <div class="note-box info-note show" style="margin-top:12px">
          <b>Conmutador:</b> en un motor real, el conmutador invierte la corriente cada media vuelta para que el torque siempre gire en el mismo sentido.
        </div>
      </div>
    </div>
  `;

  const nEl = body.querySelector('#mt-n');
  const iEl = body.querySelector('#mt-i');
  const aEl = body.querySelector('#mt-a');
  const bEl = body.querySelector('#mt-b');
  const thetaEl = body.querySelector('#mt-theta');
  const spinBtn = body.querySelector('#mt-spin');

  let spinning = false;
  let raf = null;
  let last = performance.now();

  function torqueAt(theta, N, I, A, B) {
    return N * I * A * B * Math.sin(theta * Math.PI / 180);
  }

  function drawViz(theta, tq) {
    const svgEl = body.querySelector('#mt-viz');
    svgEl.innerHTML = '';
    const add = (tag, a) => svgEl.appendChild(Charts.svg(tag, a));
    const cx = 130, cy = 100;
    for (let y = 20; y <= 180; y += 30) {
      add('line', { x1: 15, y1: y, x2: 245, y2: y, stroke: '#f59e0b', 'stroke-width': 1.2, opacity: .5 });
    }
    const rad = theta * Math.PI / 180;
    const scaleX = Math.abs(Math.cos(rad));
    const rx = 50 * Math.max(scaleX, 0.06);
    add('ellipse', { cx, cy, rx, ry: 50, fill: 'rgba(139,92,246,.15)', stroke: '#8b5cf6', 'stroke-width': 3 });
    // rotation direction arrow
    if (Math.abs(tq) > 1e-6) {
      const dir = tq >= 0 ? 1 : -1;
      const arcR = 70;
      const a1 = -40 * dir, a2 = 40 * dir;
      const p1 = [cx + arcR * Math.cos(a1 * Math.PI / 180), cy + arcR * Math.sin(a1 * Math.PI / 180)];
      const p2 = [cx + arcR * Math.cos(a2 * Math.PI / 180), cy + arcR * Math.sin(a2 * Math.PI / 180)];
      add('path', { d: `M${p1[0]},${p1[1]} A${arcR},${arcR} 0 0 ${dir > 0 ? 1 : 0} ${p2[0]},${p2[1]}`, fill: 'none', stroke: '#ef4444', 'stroke-width': 2.5, 'marker-end': 'url(#mt-arrow)' });
    }
    const defs = Charts.svg('marker', { id: 'mt-arrow', markerWidth: 7, markerHeight: 7, refX: 5, refY: 2.5, orient: 'auto' });
    defs.appendChild(Charts.svg('path', { d: 'M0,0 L5,2.5 L0,5 Z', fill: '#ef4444' }));
    const w = Charts.svg('defs'); w.appendChild(defs); svgEl.appendChild(w);
    add('text', { x: cx, y: cy + 78, fill: 'currentColor', 'font-size': 11, 'text-anchor': 'middle' }).textContent = `θ = ${theta.toFixed(0)}°`;
  }

  function drawGraph(theta, N, I, A, B, tqNow) {
    const pts = [];
    for (let th = 0; th <= 180; th += 3) pts.push([th, torqueAt(th, N, I, A, B)]);
    const maxAbs = Math.max(...pts.map(p => Math.abs(p[1])), Math.abs(tqNow), 1e-9) * 1.15;
    const container = body.querySelector('#mt-graph');
    container.innerHTML = '';
    const chart = Charts.lineChart({
      width: 300, height: 160, xMin: 0, xMax: 180, yMin: -maxAbs, yMax: maxAbs,
      xTicks: [0, 45, 90, 135, 180],
      theme: currentTheme(),
      series: [
        { points: pts, color: '#8b5cf6' },
        { points: [[theta, tqNow]], color: '#ef4444', point: [theta, tqNow] },
      ],
    });
    container.appendChild(chart);
  }

  function update() {
    const N = parseFloat(nEl.value);
    const I = parseFloat(iEl.value);
    const A = parseFloat(aEl.value) * 1e-4;
    const B = parseFloat(bEl.value);
    const theta = parseFloat(thetaEl.value);

    body.querySelector('#mt-n-val').textContent = N;
    body.querySelector('#mt-i-val').textContent = `${I.toFixed(2)} A`;
    body.querySelector('#mt-a-val').textContent = `${aEl.value} cm²`;
    body.querySelector('#mt-b-val').textContent = `${B.toFixed(2)} T`;
    body.querySelector('#mt-t-val').textContent = `${theta.toFixed(0)}°`;

    const tq = torqueAt(theta, N, I, A, B);
    body.querySelector('#mt-torque').textContent = `${Charts.fmt(Math.abs(tq), 4)} N·m`;
    body.querySelector('#mt-dir').innerHTML = Math.abs(tq) < 1e-9
      ? '<span class="badge">Sin giro</span>'
      : (tq >= 0 ? '<span class="badge attr">Horario</span>' : '<span class="badge rep">Antihorario</span>');
    body.querySelector('#mt-mu').textContent = `${Charts.fmt(N * I * A, 4)} A·m²`;

    drawViz(theta, tq);
    drawGraph(theta, N, I, A, B, tq);
  }

  [nEl, iEl, aEl, bEl, thetaEl].forEach(el => el.addEventListener('input', update));

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (spinning) {
      let th = parseFloat(thetaEl.value) + dt * 120;
      if (th > 180) th -= 180;
      thetaEl.value = th;
      update();
    }
    raf = requestAnimationFrame(frame);
  }

  spinBtn.onclick = () => {
    spinning = !spinning;
    thetaEl.disabled = spinning;
    spinBtn.textContent = spinning ? 'Detener giro' : 'Girar automáticamente';
  };

  raf = requestAnimationFrame(frame);
  const observer = new MutationObserver(() => {
    if (!document.body.contains(body)) { cancelAnimationFrame(raf); observer.disconnect(); }
  });
  observer.observe(document.getElementById('view'), { childList: true, subtree: true });

  update();
}
