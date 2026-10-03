function renderInduccion(body) {
  body.innerHTML = `
    <div class="grid3">
      <div class="panel">
        <div class="panel-title">Parámetros</div>
        ${UI.field({ id: 'i-n', label: 'Número de espiras (N)', min: 1, max: 500, step: 1, value: 50, lo: 1 })}
        ${UI.field({ id: 'i-a', label: 'Área de la espira (A)', unit: 'cm²', min: 1, max: 200, step: 1, value: 50, lo: 0 })}
        ${UI.field({ id: 'i-b', label: 'Campo magnético (B)', unit: 'T', min: 0, max: 2, step: 0.05, value: 0.5, lo: 0 })}
        ${UI.field({ id: 'i-f', label: 'Frecuencia de giro (f)', unit: 'Hz', min: 0.1, max: 5, step: 0.1, value: 1, lo: 0, loOpen: true, hint: 'Frecuencias altas se animan más lento para poder verlas.' })}
        ${UI.field({ id: 'i-r', label: 'Resistencia del circuito (R)', unit: 'Ω', min: 1, max: 1000, step: 1, value: 100, lo: 0, loOpen: true })}
        <button class="btn secondary" id="i-toggle">Pausar</button>
      </div>

      <div class="panel">
        <div class="panel-title">Espira girando en campo B</div>
        <div class="viz-box"><svg id="i-viz" width="100%" height="180" viewBox="0 0 260 180"></svg></div>
        <div class="panel-title">Gráfica: Φ(t) y FEM(t)</div>
        <div id="i-graph"></div>
        <div class="legend">
          <span style="color:#3b82f6"><i style="background:#3b82f6"></i> Flujo Φ</span>
          <span style="color:#ef4444"><i style="background:#ef4444"></i> FEM inducida</span>
          <span>(normalizadas a su valor máximo)</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Valores en tiempo real</div>
        <div class="formula-box">${M.eq('ε = -N [dΦ_B] / [dt]')}</div>
        <div class="result-row"><span class="result-label">Ángulo (θ=ωt)</span><span class="result-value" id="i-theta">0°</span></div>
        <div class="result-row"><span class="result-label">Flujo magnético (Φ)</span><span class="result-value" id="i-phi">-</span></div>
        <div class="result-row"><span class="result-label">FEM inducida (ε)</span><span class="result-value big" id="i-emf">-</span></div>
        <div class="result-row"><span class="result-label">Corriente inducida (I)</span><span class="result-value" id="i-cur">-</span></div>
        <div class="result-row"><span class="result-label">FEM máxima (NBAω)</span><span class="result-value" id="i-emfmax">-</span></div>
        <div class="result-row"><span class="result-label">FEM eficaz (ε<sub>máx</sub>/√2)</span><span class="result-value" id="i-rms">-</span></div>
        <div class="note-box info-note show" style="margin-top:12px">
          <b>Ley de Lenz:</b> la corriente inducida se opone al cambio de flujo que la produce.
        </div>
      </div>
    </div>
  `;

  const toggleBtn = body.querySelector('#i-toggle');

  let running = true;
  let t = 0;
  let raf = null;
  let last = performance.now();

  function drawCoil(theta) {
    const svgEl = body.querySelector('#i-viz');
    svgEl.innerHTML = '';
    const add = (tag, a) => svgEl.appendChild(Charts.svg(tag, a));
    const cx = 130, cy = 90;
    // field lines (horizontal arrows through region)
    for (let y = 20; y <= 160; y += 30) {
      add('line', { x1: 20, y1: y, x2: 240, y2: y, stroke: '#f59e0b', 'stroke-width': 1.3, opacity: .55, 'marker-end': 'url(#i-arrow)' });
    }
    const defs = Charts.svg('marker', { id: 'i-arrow', markerWidth: 7, markerHeight: 7, refX: 5, refY: 2.5, orient: 'auto' });
    defs.appendChild(Charts.svg('path', { d: 'M0,0 L5,2.5 L0,5 Z', fill: '#f59e0b' }));
    const w = Charts.svg('defs'); w.appendChild(defs); svgEl.appendChild(w);

    // rotating coil (ellipse simulating perspective of rotation)
    const scaleX = Math.abs(Math.cos(theta));
    const rx = 45 * Math.max(scaleX, 0.06);
    add('ellipse', { cx, cy, rx, ry: 45, fill: 'rgba(59,130,246,.15)', stroke: '#3b82f6', 'stroke-width': 3 });
    add('text', { x: cx, y: cy + 65, fill: 'currentColor', 'font-size': 11, 'text-anchor': 'middle' }).textContent = `θ = ${(theta * 180 / Math.PI % 360).toFixed(0)}°`;
  }

  function drawGraph(theta) {
    const N = UI.raw(body, 'i-n');
    const A = UI.raw(body, 'i-a') * 1e-4;
    const B = UI.raw(body, 'i-b');
    const f = UI.raw(body, 'i-f');
    const w = 2 * Math.PI * f;
    const T = 1 / f;

    const phiPts = [], emfPts = [];
    const phiMax = B * A;
    const emfMax = N * B * A * w;
    for (let i = 0; i <= 80; i++) {
      const tt = (i / 80) * T;
      const th = w * tt;
      // cada curva se normaliza a su máximo: Φ (Wb) y ε (V) tienen escalas muy distintas
      phiPts.push([tt, Math.cos(th)]);
      emfPts.push([tt, Math.sin(th)]);
    }
    const tNow = (t % T);
    const phiNow = phiMax * Math.cos(w * tNow);
    const emfNow = emfMax * Math.sin(w * tNow);

    const container = body.querySelector('#i-graph');
    container.innerHTML = '';
    const maxY = 1.15;
    const chart = Charts.lineChart({
      width: 300, height: 160, xMin: 0, xMax: T, yMin: -maxY, yMax: maxY,
      xTicks: [0, T * 0.25, T * 0.5, T * 0.75, T].map(v => Charts.round(v, 2)),
      theme: currentTheme(),
      series: [
        { points: phiPts, color: '#3b82f6' },
        { points: emfPts, color: '#ef4444' },
        { points: [[tNow, Math.cos(w * tNow)]], color: '#3b82f6', point: [tNow, Math.cos(w * tNow)] },
        { points: [[tNow, Math.sin(w * tNow)]], color: '#ef4444', point: [tNow, Math.sin(w * tNow)] },
      ],
    });
    container.appendChild(chart);
    return { phiNow, emfNow, emfMax };
  }

  function frame(now) {
    if (running) {
      const dt = Math.min((now - last) / 1000, 0.05);
      t += dt;
    }
    last = now;
    const f = UI.raw(body, 'i-f');
    // por encima de 5 Hz el giro se ve a cámara lenta (los valores siguen siendo los reales)
    t %= 1 / f;
    const theta = 2 * Math.PI * f * t;

    drawCoil(f > 5 ? theta * 5 / f : theta);
    const { phiNow, emfNow, emfMax } = drawGraph(theta);

    const R = UI.raw(body, 'i-r');
    body.querySelector('#i-theta').textContent = `${(theta * 180 / Math.PI % 360).toFixed(0)}°`;
    body.querySelector('#i-phi').textContent = Charts.sci(phiNow, 'Wb');
    body.querySelector('#i-emf').textContent = Charts.sci(emfNow, 'V');
    body.querySelector('#i-cur').textContent = Charts.sci(emfNow / R, 'A');
    body.querySelector('#i-emfmax').textContent = Charts.sci(emfMax, 'V');
    body.querySelector('#i-rms').textContent = Charts.sci(emfMax / Math.SQRT2, 'V');

    raf = requestAnimationFrame(frame);
  }

  UI.bind(body, ['i-n', 'i-a', 'i-b', 'i-f', 'i-r'], () => {});

  toggleBtn.onclick = () => {
    running = !running;
    toggleBtn.textContent = running ? 'Pausar' : 'Reanudar';
  };

  raf = requestAnimationFrame(frame);

  const observer = new MutationObserver(() => {
    if (!document.body.contains(body)) { cancelAnimationFrame(raf); observer.disconnect(); }
  });
  observer.observe(document.getElementById('view'), { childList: true, subtree: true });
}
