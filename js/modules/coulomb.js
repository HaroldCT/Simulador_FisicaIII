const MEDIOS_COULOMB = {
  'Vacío': 1,
  'Aire': 1.0006,
  'Agua': 80,
  'Aceite': 2.2,
  'Vidrio': 5,
  'Papel': 3.7,
  'Personalizado': null,
};
const K0 = 8.99e9;

function renderCoulomb(body) {
  body.innerHTML = `
    <div class="grid3">
      <div class="panel">
        <div class="panel-title">Parámetros</div>
        ${UI.field({ id: 'c-q1', label: 'Carga 1 (q₁)', units: UI.CHARGE_UNITS, min: -10, max: 10, step: 0.1, value: 5 })}
        ${UI.field({ id: 'c-q2', label: 'Carga 2 (q₂)', units: UI.CHARGE_UNITS, min: -10, max: 10, step: 0.1, value: -3 })}
        ${UI.field({ id: 'c-r', label: 'Distancia (r)', units: UI.LENGTH_UNITS, min: 0.01, max: 1, step: 0.01, value: 0.2, lo: 0, loOpen: true, hint: 'Debe ser mayor que 0.' })}

        <div class="field">
          <label for="c-medio">Medio</label>
          <select id="c-medio">
            ${Object.keys(MEDIOS_COULOMB).map(m => `<option ${m === 'Aire' ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div id="c-er-wrap" style="display:none">
          ${UI.field({ id: 'c-er', label: 'Permitividad relativa (εᵣ)', value: 1, lo: 1, hint: 'εᵣ ≥ 1' })}
        </div>

        <button class="btn secondary" id="c-reset">Reiniciar</button>
      </div>

      <div class="panel">
        <div class="panel-title">Visualización</div>
        <div class="viz-box"><svg id="c-viz" width="100%" height="220" viewBox="0 0 420 220"></svg></div>
        <div class="panel-title">Gráfica: Fuerza vs. Distancia</div>
        <div id="c-graph"></div>
      </div>

      <div class="panel">
        <div class="panel-title">Resultados</div>
        <div class="formula-box">${M.eq('F = [k |q_1 q_2|] / [ε_r r^2]')}</div>
        <div class="result-row"><span class="result-label">Fuerza (magnitud)</span></div>
        <div class="result-value big" id="c-force">0 N</div>
        <div class="result-row" style="margin-top:10px"><span class="result-label">Tipo de fuerza</span><span id="c-type"></span></div>
        <div class="result-row"><span class="result-label">k efectiva (k/εᵣ)</span><span class="result-value" id="c-k">-</span></div>
        <div class="result-row"><span class="result-label">Energía potencial (U)</span><span class="result-value" id="c-u">-</span></div>
        <div class="result-row"><span class="result-label">Campo de q₁ en q₂</span><span class="result-value" id="c-e">-</span></div>
        <div style="margin-top:14px">
          <div class="panel-title" style="margin-bottom:8px">Dirección</div>
          <div class="result-row"><span class="result-label" id="c-dir1"></span></div>
          <div class="result-row"><span class="result-label" id="c-dir2"></span></div>
        </div>
        <div class="note-box info-note show" style="margin-top:14px">
          <b>Observación:</b> La fuerza es inversamente proporcional al cuadrado de la distancia (F ∝ 1/r²). Ambas cargas sienten fuerzas iguales y opuestas (3.ª ley de Newton).
        </div>
      </div>
    </div>
  `;

  const medioEl = body.querySelector('#c-medio');
  const erWrap = body.querySelector('#c-er-wrap');
  const posColor = '#3b82f6', negColor = '#ef4444';

  function update() {
    const q1 = UI.get(body, 'c-q1');
    const q2 = UI.get(body, 'c-q2');
    const r = UI.get(body, 'c-r');
    const custom = MEDIOS_COULOMB[medioEl.value] === null;
    erWrap.style.display = custom ? '' : 'none';
    const er = custom ? UI.raw(body, 'c-er') : MEDIOS_COULOMB[medioEl.value];
    const k = K0 / er;

    const F = k * Math.abs(q1 * q2) / (r * r);
    const U = k * q1 * q2 / r;
    const E = k * Math.abs(q1) / (r * r);
    const none = q1 === 0 || q2 === 0;
    const attractive = (q1 * q2) < 0;

    body.querySelector('#c-force').textContent = Charts.sci(F, 'N');
    body.querySelector('#c-k').textContent = Charts.sci(k, 'N·m²/C²');
    body.querySelector('#c-u').textContent = Charts.sci(U, 'J');
    body.querySelector('#c-e').textContent = Charts.sci(E, 'N/C');
    body.querySelector('#c-type').innerHTML = none
      ? '<span class="badge">Sin interacción</span>'
      : `<span class="badge ${attractive ? 'attr' : 'rep'}">${attractive ? 'Atractiva' : 'Repulsiva'}</span>`;

    const c1 = q1 >= 0 ? posColor : negColor, c2 = q2 >= 0 ? posColor : negColor;
    body.querySelector('#c-dir1').innerHTML = none ? 'Sin fuerza sobre q₁'
      : `<b style="color:${c1}">●</b> F₂ sobre 1: ${attractive ? '→ (hacia q₂)' : '← (se aleja de q₂)'}`;
    body.querySelector('#c-dir2').innerHTML = none ? 'Sin fuerza sobre q₂'
      : `<b style="color:${c2}">●</b> F₁ sobre 2: ${attractive ? '← (hacia q₁)' : '→ (se aleja de q₁)'}`;

    drawViz(body.querySelector('#c-viz'), q1, q2, r, attractive, none);
    drawGraph(body.querySelector('#c-graph'), q1, q2, k, r, F);
  }

  function drawViz(svgEl, q1, q2, r, attractive, none) {
    svgEl.innerHTML = '';
    const cy = 100;
    // separación visual: proporcional a la posición del slider de distancia
    const rng = body.querySelector('#c-r-range');
    const frac = Math.min(1, Math.max(0, (parseFloat(rng.value) - parseFloat(rng.min)) / (parseFloat(rng.max) - parseFloat(rng.min))));
    const gap = 90 + frac * 220;
    const cx1 = 210 - gap / 2;
    const cx2 = 210 + gap / 2;

    const defsWrap = Charts.svg('defs');
    [posColor, negColor].forEach(c => {
      const mk = Charts.svg('marker', { id: `arrow-${c.replace('#', '')}`, markerWidth: 8, markerHeight: 8, refX: 6, refY: 3, orient: 'auto' });
      mk.appendChild(Charts.svg('path', { d: 'M0,0 L6,3 L0,6 Z', fill: c }));
      defsWrap.appendChild(mk);
    });
    svgEl.appendChild(defsWrap);

    [[cx1, q1, 'q₁'], [cx2, q2, 'q₂']].forEach(([cx, q, label]) => {
      const color = q > 0 ? posColor : q < 0 ? negColor : '#8b93ad';
      const rad = 12 + 8 * Math.min(1, Math.abs(UI.raw(body, label === 'q₁' ? 'c-q1' : 'c-q2')) / 10);
      svgEl.appendChild(Charts.svg('circle', { cx, cy, r: rad, fill: color }));
      const sign = Charts.svg('text', { x: cx, y: cy + 5, fill: '#fff', 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      sign.textContent = q > 0 ? '+' : q < 0 ? '−' : '0';
      svgEl.appendChild(sign);
      const lbl = Charts.svg('text', { x: cx, y: cy + 42, fill: 'currentColor', 'font-size': 12, 'text-anchor': 'middle' });
      lbl.textContent = label;
      svgEl.appendChild(lbl);
    });

    if (!none) {
      const arrowLen = 46;
      const arrow = (x1, dir, color) => {
        svgEl.appendChild(Charts.svg('line', { x1, y1: cy - 40, x2: x1 + dir * arrowLen, y2: cy - 40, stroke: color, 'stroke-width': 2.5, 'marker-end': `url(#arrow-${color.replace('#', '')})` }));
      };
      const dir1 = attractive ? 1 : -1;
      const dir2 = -dir1;
      const col1 = q1 > 0 ? posColor : negColor, col2 = q2 > 0 ? posColor : negColor;
      arrow(cx1, dir1, col1);
      arrow(cx2, dir2, col2);
      const t1 = Charts.svg('text', { x: cx1 + (dir1 * arrowLen) / 2, y: cy - 50, fill: col1, 'font-size': 10, 'text-anchor': 'middle' });
      t1.textContent = 'F₂ sobre 1';
      svgEl.appendChild(t1);
      const t2 = Charts.svg('text', { x: cx2 + (dir2 * arrowLen) / 2, y: cy - 50, fill: col2, 'font-size': 10, 'text-anchor': 'middle' });
      t2.textContent = 'F₁ sobre 2';
      svgEl.appendChild(t2);
    }

    svgEl.appendChild(Charts.svg('line', { x1: cx1, y1: cy + 58, x2: cx2, y2: cy + 58, stroke: 'currentColor', 'stroke-width': 1, opacity: .4 }));
    const dtxt = Charts.svg('text', { x: (cx1 + cx2) / 2, y: cy + 74, fill: 'currentColor', 'font-size': 11, 'text-anchor': 'middle', opacity: .7 });
    dtxt.textContent = `r = ${Charts.sci(UI.raw(body, 'c-r'))} ${UI.unitLabel(body, 'c-r')}`;
    svgEl.appendChild(dtxt);
  }

  function drawGraph(container, q1, q2, k, currentR, currentF) {
    container.innerHTML = '';
    // eje x en la unidad elegida por el usuario, de r/4 a 3r
    const uf = parseFloat(body.querySelector('#c-r-unit').value);
    const rDisp = currentR / uf;
    const x0 = rDisp * 0.25, x1 = rDisp * 3;
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const x = x0 + (x1 - x0) * (i / 80);
      const rr = x * uf;
      pts.push([x, k * Math.abs(q1 * q2) / (rr * rr)]);
    }
    const maxF = Math.max(...pts.map(p => p[1]), currentF) * 1.05 || 1;
    const chart = Charts.lineChart({
      width: 300, height: 170, xMin: x0, xMax: x1, yMin: 0, yMax: maxF,
      xTicks: [0, 0.25, 0.5, 0.75, 1].map(f => x0 + (x1 - x0) * f),
      theme: currentTheme(),
      series: [{ points: pts, color: '#3b82f6', point: [rDisp, currentF] }],
    });
    container.appendChild(chart);
    const cap = document.createElement('div');
    cap.className = 'field-hint';
    cap.style.textAlign = 'center';
    cap.textContent = `Eje x: r (${UI.unitLabel(body, 'c-r')}) · Eje y: F (N)`;
    container.appendChild(cap);
  }

  UI.bind(body, ['c-q1', 'c-q2', 'c-r', 'c-er'], update);
  medioEl.addEventListener('change', update);
  body.querySelector('#c-reset').onclick = () => {
    UI.set(body, 'c-q1', 5, 1e-6);
    UI.set(body, 'c-q2', -3, 1e-6);
    UI.set(body, 'c-r', 0.2, 1);
    UI.set(body, 'c-er', 1);
    medioEl.value = 'Aire';
    update();
  };
  setRedraw(update);
  update();
}
