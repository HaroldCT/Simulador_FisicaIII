// qe: carga en múltiplos de e · mu: masa en unidades de masa atómica (u)
const PARTICULAS = {
  'Protón': { qe: 1, mu: 1.007 },
  'Electrón': { qe: -1, mu: 0.000549 },
  'Partícula alfa': { qe: 2, mu: 4.0015 },
  'Neutrón': { qe: 0, mu: 1.0087 },
  'Personalizada': { qe: null, mu: null },
};

function renderMagnetismo(body) {
  const Q_UNITS = [
    { label: 'e', f: 1.602e-19, sel: true }, { label: 'nC', f: 1e-9 }, { label: 'µC', f: 1e-6 }, { label: 'C', f: 1 },
  ];
  const M_UNITS = [
    { label: 'kg', f: 1 }, { label: 'u', f: 1.6605e-27, sel: true }, { label: 'mₑ', f: 9.109e-31 },
  ];
  const V_UNITS = [{ label: 'm/s', f: 1, sel: true }, { label: 'km/s', f: 1e3 }];
  const B_UNITS = [{ label: 'T', f: 1, sel: true }, { label: 'mT', f: 1e-3 }, { label: 'G', f: 1e-4 }];

  body.innerHTML = `
    <div class="grid3">
      <div class="panel">
        <div class="panel-title">Parámetros</div>
        <div class="field">
          <label for="m-part">Partícula</label>
          <select id="m-part">
            ${Object.keys(PARTICULAS).map(p => `<option>${p}</option>`).join('')}
          </select>
        </div>
        ${UI.field({ id: 'm-q', label: 'Carga (q)', units: Q_UNITS, min: -3, max: 3, step: 0.1, value: 1 })}
        ${UI.field({ id: 'm-m', label: 'Masa (m)', units: M_UNITS, min: 0.001, max: 10, step: 0.001, value: 1.007, lo: 0, loOpen: true })}
        ${UI.field({ id: 'm-v', label: 'Velocidad (v)', units: V_UNITS, min: 0, max: 1e7, step: 1e4, value: 2e6, lo: 0, hi: 3e8 })}
        ${UI.field({ id: 'm-b', label: 'Campo magnético (B)', units: B_UNITS, min: 0, max: 3, step: 0.01, value: 1, lo: 0 })}
        ${UI.field({ id: 'm-theta', label: 'Ángulo entre v y B (θ)', unit: '°', min: 0, max: 180, step: 1, value: 90, lo: 0, hi: 180 })}
      </div>

      <div class="panel">
        <div class="panel-title">Visualización</div>
        <div class="viz-box"><svg id="m-viz" width="100%" height="260" viewBox="0 0 380 260"></svg></div>
        <div class="legend">
          <span style="color:#3b82f6">→ Velocidad (v)</span>
          <span style="color:#f59e0b">→ Campo B</span>
          <span style="color:#ef4444">⊙⊗ Fuerza (F)</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Resultados</div>
        <div class="formula-box">${M.eq('F = |q| v B sen θ')}</div>
        <div class="result-row"><span class="result-label">Fuerza de Lorentz</span></div>
        <div class="result-value big" id="m-f">0 N</div>
        <div class="result-row" style="margin-top:10px"><span class="result-label">Dirección de F</span><span class="result-value" id="m-fdir">-</span></div>
        <div class="result-row"><span class="result-label">Trayectoria</span><span class="result-value" id="m-tray">-</span></div>
        <div class="result-row"><span class="result-label">Radio de giro (r = mv⊥/|q|B)</span><span class="result-value" id="m-r">-</span></div>
        <div class="result-row"><span class="result-label">Periodo (T = 2πm/|q|B)</span><span class="result-value" id="m-per">-</span></div>
        <div class="result-row"><span class="result-label">Paso de la hélice (v∥T)</span><span class="result-value" id="m-paso">-</span></div>
        <div class="note-box info-note show" style="margin-top:12px">
          <b>Regla de la mano derecha:</b> apunta los dedos en la dirección de v y ciérralos hacia B; el pulgar indica F (para q positiva).
        </div>
      </div>
    </div>
  `;

  const partEl = body.querySelector('#m-part');

  partEl.onchange = () => {
    const p = PARTICULAS[partEl.value];
    if (p.qe !== null) { UI.set(body, 'm-q', p.qe, 1.602e-19); UI.set(body, 'm-m', p.mu, 1.6605e-27); }
    update();
  };

  function update() {
    const q = UI.get(body, 'm-q');
    const m = UI.get(body, 'm-m');
    const v = UI.get(body, 'm-v');
    const B = UI.get(body, 'm-b');
    const theta = UI.raw(body, 'm-theta');
    const rad = theta * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad)) < 1e-12 ? 0 : Math.sin(rad);
    const F = Math.abs(q) * v * B * sin;

    // v en +x, B en el plano formando θ con v; F = q (v × B) solo tiene componente z
    const Fz = q * v * B * sin;

    body.querySelector('#m-f').textContent = Charts.sci(F, 'N');
    body.querySelector('#m-fdir').innerHTML = F === 0
      ? '<span class="badge">Sin fuerza</span>'
      : Fz > 0 ? '<span class="badge attr">⊙ Hacia el lector</span>'
        : '<span class="badge rep">⊗ Hacia la pantalla</span>';

    const vPerp = v * sin;
    const vPar = v * Math.cos(rad);
    const qB = Math.abs(q) * B;
    const r = qB > 0 ? (m * vPerp) / qB : Infinity;
    const T = qB > 0 ? (2 * Math.PI * m) / qB : Infinity;

    let tray;
    if (qB === 0 || v === 0) tray = v === 0 ? 'En reposo' : 'Rectilínea';
    else if (vPerp === 0) tray = 'Rectilínea (v ∥ B)';
    else if (Math.abs(vPar) < v * 1e-9) tray = 'Circular';
    else tray = 'Helicoidal';

    body.querySelector('#m-tray').textContent = tray;
    body.querySelector('#m-r').textContent = isFinite(r) && vPerp > 0 ? Charts.sci(r, 'm') : '∞ (no gira)';
    body.querySelector('#m-per').textContent = isFinite(T) ? Charts.sci(T, 's') : '-';
    body.querySelector('#m-paso').textContent = tray === 'Helicoidal' ? Charts.sci(Math.abs(vPar) * T, 'm') : '-';

    drawViz(theta, Fz, F);
  }

  function drawViz(theta, Fz, F) {
    const svgEl = body.querySelector('#m-viz');
    svgEl.innerHTML = '';
    const add = (tag, a) => svgEl.appendChild(Charts.svg(tag, a));
    const cx = 130, cy = 150;

    ['#3b82f6', '#f59e0b'].forEach(c => {
      const defs = Charts.svg('marker', { id: `mk-${c.replace('#', '')}`, markerWidth: 8, markerHeight: 8, refX: 6, refY: 3, orient: 'auto' });
      defs.appendChild(Charts.svg('path', { d: 'M0,0 L6,3 L0,6 Z', fill: c }));
      const w = Charts.svg('defs'); w.appendChild(defs); svgEl.appendChild(w);
    });

    // origin point
    add('circle', { cx, cy, r: 4, fill: 'currentColor' });

    // v vector along +x
    const vLen = 90;
    add('line', { x1: cx, y1: cy, x2: cx + vLen, y2: cy, stroke: '#3b82f6', 'stroke-width': 2.5, 'marker-end': 'url(#mk-3b82f6)' });
    add('text', { x: cx + vLen + 10, y: cy + 4, fill: '#3b82f6', 'font-size': 13, 'font-weight': 700 }).textContent = 'v';

    // B vector at angle theta
    const rad = theta * Math.PI / 180;
    const bLen = 90;
    const bx = cx + Math.cos(rad) * bLen, by = cy - Math.sin(rad) * bLen;
    add('line', { x1: cx, y1: cy, x2: bx, y2: by, stroke: '#f59e0b', 'stroke-width': 2.5, 'marker-end': 'url(#mk-f59e0b)' });
    add('text', { x: bx + (Math.cos(rad) >= 0 ? 8 : -18), y: by - 6, fill: '#f59e0b', 'font-size': 13, 'font-weight': 700 }).textContent = 'B';

    // angle arc
    const arcR = 30;
    const largeArc = theta > 180 ? 1 : 0;
    const ax = cx + arcR, ay = cy;
    const ex = cx + Math.cos(rad) * arcR, ey = cy - Math.sin(rad) * arcR;
    add('path', { d: `M${ax},${ay} A${arcR},${arcR} 0 ${largeArc} 0 ${ex},${ey}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 1, opacity: .5 });

    // F symbol (out of / into page) at a fixed offset point
    const fx = cx + 60, fy = cy + 70;
    if (F > 0) {
      add('circle', { cx: fx, cy: fy, r: 14, fill: 'none', stroke: '#ef4444', 'stroke-width': 2.5 });
      if (Fz >= 0) {
        add('circle', { cx: fx, cy: fy, r: 3.5, fill: '#ef4444' });
      } else {
        add('line', { x1: fx - 8, y1: fy - 8, x2: fx + 8, y2: fy + 8, stroke: '#ef4444', 'stroke-width': 2 });
        add('line', { x1: fx - 8, y1: fy + 8, x2: fx + 8, y2: fy - 8, stroke: '#ef4444', 'stroke-width': 2 });
      }
      add('text', { x: fx, y: fy + 28, fill: '#ef4444', 'font-size': 11, 'text-anchor': 'middle', 'font-weight': 700 }).textContent = 'F';
    }

  }

  UI.bind(body, ['m-q', 'm-m', 'm-v', 'm-b', 'm-theta'], () => {
    // al editar a mano, la partícula pasa a ser personalizada
    partEl.value = 'Personalizada';
    update();
  });
  update();
}
