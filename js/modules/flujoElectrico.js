const EPS0 = 8.854e-12;

function renderFlujoElectrico(body) {
  const K = 8.99e9;
  let charges = [
    { q: 3, x: 0, y: 0 },
    { q: -1, x: 0.3, y: 0.2 },
    { q: 2, x: 1.4, y: 0.4 },
  ];

  body.innerHTML = `
    <div class="grid3">
      <div class="panel">
        <div class="panel-title">Parámetros</div>
        <div class="field">
          <label for="f-mode">Tipo de problema</label>
          <select id="f-mode">
            <option value="plana">Superficie plana en campo uniforme</option>
            <option value="gauss">Superficie cerrada (Ley de Gauss)</option>
          </select>
        </div>

        <div id="f-plana">
          ${UI.field({ id: 'f-e', label: 'Campo eléctrico (E)', unit: 'N/C', min: 0, max: 1000, step: 1, value: 500 })}
          <div class="field">
            <label for="f-shape">Forma de la superficie</label>
            <select id="f-shape">
              <option value="rect">Rectangular (a × b)</option>
              <option value="circ">Circular (radio r)</option>
              <option value="area">Ingresar área directamente</option>
            </select>
          </div>
          <div id="f-shape-rect">
            ${UI.field({ id: 'f-a', label: 'Lado a', units: UI.LENGTH_UNITS, min: 0, max: 2, step: 0.01, value: 0.5, lo: 0 })}
            ${UI.field({ id: 'f-b', label: 'Lado b', units: UI.LENGTH_UNITS, min: 0, max: 2, step: 0.01, value: 0.4, lo: 0 })}
          </div>
          <div id="f-shape-circ" style="display:none">
            ${UI.field({ id: 'f-rad', label: 'Radio r', units: UI.LENGTH_UNITS, min: 0, max: 2, step: 0.01, value: 0.3, lo: 0 })}
          </div>
          <div id="f-shape-area" style="display:none">
            ${UI.field({ id: 'f-area', label: 'Área A', unit: 'm²', min: 0, max: 5, step: 0.01, value: 0.2, lo: 0 })}
          </div>
          ${UI.field({ id: 'f-theta', label: 'Ángulo entre E y la normal n̂ (θ)', unit: '°', min: 0, max: 180, step: 1, value: 30, lo: -360, hi: 360 })}
        </div>

        <div id="f-gauss" style="display:none">
          <div class="field">
            <label for="f-surf">Superficie gaussiana (centrada en el origen)</label>
            <select id="f-surf">
              <option value="esfera">Esfera de radio R</option>
              <option value="cubo">Cubo de lado L</option>
            </select>
          </div>
          ${UI.field({ id: 'f-size', label: 'Tamaño (R o L)', units: UI.LENGTH_UNITS, min: 0.05, max: 3, step: 0.01, value: 1, lo: 0, loOpen: true })}
          <div class="field">
            <label>Añadir carga (plano z = 0)</label>
            <div class="charge-grid head"><span>q (µC)</span><span>x (m)</span><span>y (m)</span><span></span></div>
            <div class="charge-grid">
              <input type="number" id="f-new-q" value="1" step="any">
              <input type="number" id="f-new-x" value="0" step="any">
              <input type="number" id="f-new-y" value="-0.5" step="any">
              <button class="btn" id="f-add" title="Añadir carga">+</button>
            </div>
          </div>
          <div class="field">
            <label>Cargas (editables)</label>
            <div id="f-charge-list"></div>
          </div>
          <button class="btn secondary" id="f-clear">Quitar todas las cargas</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title" id="f-viz-title">Visualización</div>
        <div class="viz-box" id="f-viz-wrap"></div>
        <div class="panel-title" id="f-graph-title">Gráfica</div>
        <div id="f-graph"></div>
      </div>

      <div class="panel">
        <div class="panel-title">Resultados</div>
        <div class="formula-box" id="f-formula"></div>
        <div id="f-results"></div>
        <div class="note-box info-note show" style="margin-top:14px" id="f-note"></div>
      </div>
    </div>
  `;

  const modeEl = body.querySelector('#f-mode');
  const shapeEl = body.querySelector('#f-shape');
  const surfEl = body.querySelector('#f-surf');
  const vizWrap = body.querySelector('#f-viz-wrap');

  // ---------------- Superficie plana ----------------
  function areaPlana() {
    const shape = shapeEl.value;
    if (shape === 'rect') return UI.get(body, 'f-a') * UI.get(body, 'f-b');
    if (shape === 'circ') { const r = UI.get(body, 'f-rad'); return Math.PI * r * r; }
    return UI.raw(body, 'f-area');
  }

  function updatePlana() {
    ['rect', 'circ', 'area'].forEach(s => {
      body.querySelector('#f-shape-' + s).style.display = shapeEl.value === s ? '' : 'none';
    });
    const E = UI.raw(body, 'f-e');
    const A = areaPlana();
    const thetaDeg = UI.raw(body, 'f-theta');
    const th = thetaDeg * Math.PI / 180;
    const cos = Math.abs(Math.cos(th)) < 1e-12 ? 0 : Math.cos(th);
    const phi = E * A * cos;

    body.querySelector('#f-formula').innerHTML = M.eq('Φ_E = E A cos θ');
    const sentido = Math.abs(phi) < 1e-15
      ? '<span class="badge">Nulo (E paralelo a la superficie)</span>'
      : phi > 0 ? '<span class="badge attr">Positivo (sale por la cara de n̂)</span>'
        : '<span class="badge rep">Negativo (entra por la cara de n̂)</span>';
    body.querySelector('#f-results').innerHTML = `
      <div class="result-row"><span class="result-label">Flujo eléctrico (Φ)</span></div>
      <div class="result-value big">${Charts.sci(phi, 'N·m²/C')}</div>
      <div class="result-row" style="margin-top:10px"><span class="result-label">Signo</span>${sentido}</div>
      <div class="result-row"><span class="result-label">Área (A)</span><span class="result-value">${Charts.sci(A, 'm²')}</span></div>
      <div class="result-row"><span class="result-label">Área efectiva (A cos θ)</span><span class="result-value">${Charts.sci(A * cos, 'm²')}</span></div>
      <div class="result-row"><span class="result-label">Flujo máximo (θ = 0°)</span><span class="result-value">${Charts.sci(E * A, 'N·m²/C')}</span></div>
      <div class="result-row"><span class="result-label">Carga equivalente (ε₀Φ)</span><span class="result-value">${Charts.sci(EPS0 * phi, 'C')}</span></div>
    `;
    body.querySelector('#f-note').innerHTML = '<b>Interpretación:</b> el flujo mide cuántas líneas de campo atraviesan la superficie. Es máximo cuando E es perpendicular a la superficie (θ = 0°) y nulo cuando E es paralelo a ella (θ = 90°).';

    drawPlana(E, thetaDeg, phi);
    graphPlana(E, A, thetaDeg, phi);
  }

  function drawPlana(E, thetaDeg, phi) {
    body.querySelector('#f-viz-title').textContent = 'Vista lateral (la superficie se ve de canto)';
    vizWrap.innerHTML = '<svg id="f-svg" width="100%" height="240" viewBox="0 0 420 240"></svg>';
    const svgEl = vizWrap.querySelector('svg');
    const add = (tag, a) => svgEl.appendChild(Charts.svg(tag, a));
    const defs = Charts.svg('defs');
    [['f-ar-dim', '#8b93ad'], ['f-ar-in', '#16a34a'], ['f-ar-neg', '#ef4444'], ['f-ar-n', '#f59e0b']].forEach(([id, c]) => {
      const mk = Charts.svg('marker', { id, markerWidth: 8, markerHeight: 8, refX: 6, refY: 3, orient: 'auto' });
      mk.appendChild(Charts.svg('path', { d: 'M0,0 L6,3 L0,6 Z', fill: c }));
      defs.appendChild(mk);
    });
    svgEl.appendChild(defs);

    const cx = 210, cy = 120, half = 80;
    const th = thetaDeg * Math.PI / 180;
    const reach = half * Math.abs(Math.cos(th));
    if (E > 0) {
      for (let y = 22; y <= 218; y += 14) {
        const crosses = Math.abs(y - cy) <= reach;
        const id = !crosses ? 'f-ar-dim' : (phi >= 0 ? 'f-ar-in' : 'f-ar-neg');
        const col = !crosses ? '#8b93ad' : (phi >= 0 ? '#16a34a' : '#ef4444');
        add('line', { x1: 20, y1: y, x2: 395, y2: y, stroke: col, 'stroke-width': crosses ? 1.8 : 1, opacity: crosses ? .95 : .45, 'marker-end': `url(#${id})` });
      }
    }
    add('text', { x: 24, y: 14, fill: 'currentColor', 'font-size': 11, opacity: .7 }).textContent = E > 0 ? 'E →' : 'E = 0';

    // superficie: perpendicular a la normal n̂ = (cos θ, sen θ)
    const dx = Math.sin(th) * half, dy = Math.cos(th) * half;
    add('line', { x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy, stroke: '#3b82f6', 'stroke-width': 6, 'stroke-linecap': 'round' });
    const nx = cx + Math.cos(th) * 55, ny = cy - Math.sin(th) * 55;
    add('line', { x1: cx, y1: cy, x2: nx, y2: ny, stroke: '#f59e0b', 'stroke-width': 2.5, 'marker-end': 'url(#f-ar-n)' });
    add('text', { x: nx + 6, y: ny - 4, fill: '#f59e0b', 'font-size': 13, 'font-weight': 700 }).textContent = 'n̂';
    // arco del ángulo θ
    const ar = 26;
    const ex = cx + Math.cos(th) * ar, ey = cy - Math.sin(th) * ar;
    const norm = ((thetaDeg % 360) + 360) % 360;
    add('path', { d: `M${cx + ar},${cy} A${ar},${ar} 0 ${norm > 180 ? 1 : 0} 0 ${ex},${ey}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 1, opacity: .6 });
    add('text', { x: cx + 32, y: cy + 16, fill: 'currentColor', 'font-size': 11, opacity: .8 }).textContent = `θ = ${Charts.sci(thetaDeg)}°`;
  }

  function graphPlana(E, A, thetaDeg, phi) {
    body.querySelector('#f-graph-title').textContent = 'Gráfica: Flujo vs. ángulo θ';
    const pts = [];
    for (let t = 0; t <= 180; t += 3) pts.push([t, E * A * Math.cos(t * Math.PI / 180)]);
    const m = Math.max(E * A, 1e-30) * 1.1;
    const norm = ((thetaDeg % 360) + 360) % 360;
    const shown = norm <= 180 ? norm : 360 - norm; // cos es simétrico
    const container = body.querySelector('#f-graph');
    container.innerHTML = '';
    container.appendChild(Charts.lineChart({
      width: 300, height: 170, xMin: 0, xMax: 180, yMin: -m, yMax: m,
      xTicks: [0, 45, 90, 135, 180], theme: currentTheme(),
      series: [{ points: pts, color: '#3b82f6', point: [shown, phi] }],
    }));
    caption(container, 'Eje x: θ (°) · Eje y: Φ (N·m²/C)');
  }

  // ---------------- Ley de Gauss ----------------
  function inside(c, size, surf) {
    if (surf === 'esfera') return Math.hypot(c.x, c.y) < size;
    return Math.abs(c.x) < size / 2 && Math.abs(c.y) < size / 2;
  }
  function onSurface(c, size, surf) {
    const tol = size * 0.01;
    if (surf === 'esfera') return Math.abs(Math.hypot(c.x, c.y) - size) < tol;
    const m = Math.max(Math.abs(c.x), Math.abs(c.y));
    return Math.abs(m - size / 2) < tol;
  }

  // Integra numéricamente ∮ E·dA sobre la superficie cerrada (en 3D).
  function numericFlux(list, size, surf) {
    let flux = 0;
    const qs = list.map(c => ({ q: c.q * 1e-6, x: c.x, y: c.y }));
    const Eat = (px, py, pz) => {
      let ex = 0, ey = 0, ez = 0;
      for (const c of qs) {
        const dx = px - c.x, dy = py - c.y, dz = pz;
        const r2 = dx * dx + dy * dy + dz * dz;
        const r3 = r2 * Math.sqrt(r2);
        if (r3 === 0) continue;
        const f = K * c.q / r3;
        ex += f * dx; ey += f * dy; ez += f * dz;
      }
      return [ex, ey, ez];
    };
    if (surf === 'esfera') {
      const nu = 90, np = 180, R = size;
      const du = 2 / nu, dp = 2 * Math.PI / np;
      for (let i = 0; i < nu; i++) {
        const u = -1 + (i + 0.5) * du;
        const s = Math.sqrt(1 - u * u);
        for (let j = 0; j < np; j++) {
          const p = (j + 0.5) * dp;
          const nx = s * Math.cos(p), ny = s * Math.sin(p), nz = u;
          const [ex, ey, ez] = Eat(R * nx, R * ny, R * nz);
          flux += (ex * nx + ey * ny + ez * nz) * R * R * du * dp;
        }
      }
    } else {
      const n = 70, h = size / 2, d = size / n, dA = d * d;
      for (let axis = 0; axis < 3; axis++) {
        for (const sgn of [-1, 1]) {
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              const a = -h + (i + 0.5) * d, b = -h + (j + 0.5) * d;
              const p = axis === 0 ? [sgn * h, a, b] : axis === 1 ? [a, sgn * h, b] : [a, b, sgn * h];
              flux += Eat(p[0], p[1], p[2])[axis] * sgn * dA;
            }
          }
        }
      }
    }
    return flux;
  }

  function updateGauss() {
    const size = UI.get(body, 'f-size');
    const surf = surfEl.value;
    const inC = charges.filter(c => inside(c, size, surf));
    const outC = charges.filter(c => !inside(c, size, surf));
    const onC = charges.filter(c => onSurface(c, size, surf));
    const qenc = inC.reduce((s, c) => s + c.q, 0) * 1e-6;
    const phi = qenc / EPS0;
    const phiNum = numericFlux(charges, size, surf);
    const phiOut = numericFlux(outC, size, surf);
    const area = surf === 'esfera' ? 4 * Math.PI * size * size : 6 * size * size;

    body.querySelector('#f-formula').innerHTML = M.eq('∮ E · dA = [q_{enc}] / [ε_0]');
    body.querySelector('#f-results').innerHTML = `
      <div class="result-row"><span class="result-label">Carga encerrada (q<sub>enc</sub>)</span><span class="result-value">${Charts.sci(qenc, 'C')}</span></div>
      <div class="result-row"><span class="result-label">Flujo total (Gauss)</span></div>
      <div class="result-value big">${Charts.sci(phi, 'N·m²/C')}</div>
      <div class="result-row" style="margin-top:10px"><span class="result-label">Flujo por integración numérica</span><span class="result-value">${Charts.sci(phiNum, 'N·m²/C')}</span></div>
      <div class="result-row"><span class="result-label">Aporte de cargas exteriores</span><span class="result-value">${Charts.sci(Math.abs(phiOut) < Math.abs(phiNum) * 1e-3 + 1e-6 ? 0 : phiOut, 'N·m²/C')}</span></div>
      <div class="result-row"><span class="result-label">Cargas dentro / fuera</span><span class="result-value">${inC.length} / ${outC.length}</span></div>
      <div class="result-row"><span class="result-label">Área de la superficie</span><span class="result-value">${Charts.sci(area, 'm²')}</span></div>
    `;
    body.querySelector('#f-note').innerHTML = onC.length
      ? '<b>Atención:</b> hay cargas sobre la superficie gaussiana; el flujo no está bien definido. Mueve la carga o cambia el tamaño.'
      : '<b>Ley de Gauss:</b> el flujo total solo depende de la carga encerrada. Las cargas exteriores producen líneas que entran y salen, así que su aporte neto es cero (compruébalo con la integración numérica).';

    drawGauss(size, surf);
    graphGauss(size, surf, phi);
  }

  function drawGauss(size, surf) {
    body.querySelector('#f-viz-title').textContent = 'Corte en el plano z = 0';
    const W = 380, H = 300;
    vizWrap.innerHTML = `<canvas width="${W}" height="${H}"></canvas>`;
    const canvas = vizWrap.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const dark = currentTheme() === 'dark';
    const C = dark ? { grid: '#232c42', text: '#8b93ad', bg: '#0f1524' } : { grid: '#dbe0ee', text: '#5b6478', bg: '#f4f6fb' };

    let half = Math.max(size * 1.4, 0.5);
    charges.forEach(c => { half = Math.max(half, Math.abs(c.x) * 1.15, Math.abs(c.y) * 1.15 * W / H); });
    const sc = W / (2 * half);
    const toPx = (x, y) => [W / 2 + x * sc, H / 2 - y * sc];

    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();

    // superficie gaussiana
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 4]);
    ctx.fillStyle = 'rgba(139,92,246,.08)';
    ctx.beginPath();
    if (surf === 'esfera') ctx.arc(W / 2, H / 2, size * sc, 0, Math.PI * 2);
    else ctx.rect(W / 2 - size / 2 * sc, H / 2 - size / 2 * sc, size * sc, size * sc);
    ctx.fill(); ctx.stroke(); ctx.setLineDash([]);

    // vectores E·n̂ sobre la superficie: verde = sale, rojo = entra
    const samples = [];
    const n = 32;
    for (let i = 0; i < n; i++) {
      if (surf === 'esfera') {
        const a = (i / n) * Math.PI * 2;
        samples.push({ x: size * Math.cos(a), y: size * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) });
      } else {
        const per = n / 4, k = i % per, side = Math.floor(i / per);
        const t = -size / 2 + (k + 0.5) * size / per;
        const h = size / 2;
        samples.push([{ x: h, y: t, nx: 1, ny: 0 }, { x: -t, y: h, nx: 0, ny: 1 }, { x: -h, y: -t, nx: -1, ny: 0 }, { x: t, y: -h, nx: 0, ny: -1 }][side]);
      }
    }
    const vals = samples.map(s => {
      let ex = 0, ey = 0;
      charges.forEach(c => {
        const dx = s.x - c.x, dy = s.y - c.y;
        const r = Math.max(Math.hypot(dx, dy), size * 0.02);
        ex += K * c.q * 1e-6 * dx / (r * r * r);
        ey += K * c.q * 1e-6 * dy / (r * r * r);
      });
      return ex * s.nx + ey * s.ny;
    });
    const ref = Math.max(...vals.map(Math.abs), 1e-30);
    samples.forEach((s, i) => {
      const v = vals[i];
      if (Math.abs(v) < ref * 1e-3) return;
      const len = 6 + 18 * Math.max(0, 1 + Math.log10(Math.abs(v) / ref) / 2);
      const [px, py] = toPx(s.x, s.y);
      // la flecha apunta en el sentido del flujo: hacia afuera si sale, hacia la superficie si entra
      const ox = px + s.nx * len, oy = py - s.ny * len;
      if (v > 0) arrow(ctx, px, py, ox, oy, '#16a34a');
      else arrow(ctx, ox, oy, px, py, '#ef4444');
    });

    charges.forEach((c, i) => {
      const [px, py] = toPx(c.x, c.y);
      const isIn = inside(c, size, surf);
      ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fillStyle = c.q > 0 ? '#3b82f6' : c.q < 0 ? '#ef4444' : '#8b93ad';
      ctx.globalAlpha = isIn ? 1 : 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(c.q > 0 ? '+' : c.q < 0 ? '−' : '0', px, py + 4);
      ctx.fillStyle = C.text; ctx.font = '10px sans-serif';
      ctx.fillText(`q${i + 1}${isIn ? '' : ' (fuera)'}`, px, py - 14);
      ctx.textAlign = 'left';
    });

    ctx.fillStyle = C.text; ctx.font = '10px sans-serif';
    ctx.fillText('Verde: el campo sale · Rojo: el campo entra', 6, H - 6);
  }

  function arrow(ctx, x1, y1, x2, y2, c) {
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 5 * Math.cos(ang - 0.45), y2 - 5 * Math.sin(ang - 0.45));
    ctx.lineTo(x2 - 5 * Math.cos(ang + 0.45), y2 - 5 * Math.sin(ang + 0.45));
    ctx.closePath(); ctx.fill();
  }

  function graphGauss(size, surf, phiNow) {
    body.querySelector('#f-graph-title').textContent = `Gráfica: Flujo vs. tamaño de la superficie (${surf === 'esfera' ? 'R' : 'L'})`;
    const uf = parseFloat(body.querySelector('#f-size-unit').value);
    const smax = Math.max(size * 2, ...charges.map(c => (surf === 'esfera' ? Math.hypot(c.x, c.y) : 2 * Math.max(Math.abs(c.x), Math.abs(c.y))) * 1.2));
    const pts = [];
    for (let i = 1; i <= 200; i++) {
      const s = (i / 200) * smax;
      const q = charges.filter(c => inside(c, s, surf)).reduce((a, c) => a + c.q, 0) * 1e-6;
      pts.push([s / uf, q / EPS0]);
    }
    const ys = pts.map(p => p[1]).concat([0, phiNow]);
    let yMin = Math.min(...ys), yMax = Math.max(...ys);
    const pad = (yMax - yMin || Math.abs(yMax) || 1) * 0.1;
    yMin -= pad; yMax += pad;
    const container = body.querySelector('#f-graph');
    container.innerHTML = '';
    container.appendChild(Charts.lineChart({
      width: 300, height: 170, xMin: 0, xMax: smax / uf, yMin, yMax,
      xTicks: [0, 0.25, 0.5, 0.75, 1].map(f => f * smax / uf), theme: currentTheme(),
      series: [{ points: pts, color: '#8b5cf6', point: [size / uf, phiNow] }],
    }));
    caption(container, `Eje x: ${surf === 'esfera' ? 'R' : 'L'} (${UI.unitLabel(body, 'f-size')}) · Eje y: Φ (N·m²/C). Cada salto = una carga que queda encerrada.`);
  }

  function renderChargeList() {
    const list = body.querySelector('#f-charge-list');
    if (!charges.length) { list.innerHTML = '<div class="result-label">Sin cargas</div>'; return; }
    list.innerHTML = charges.map((c, i) => `
      <div class="charge-grid" data-i="${i}">
        <input type="number" step="any" data-k="q" value="${c.q}" title="q${i + 1} (µC)" style="border-left:3px solid ${c.q >= 0 ? '#3b82f6' : '#ef4444'}">
        <input type="number" step="any" data-k="x" value="${c.x}" title="x${i + 1} (m)">
        <input type="number" step="any" data-k="y" value="${c.y}" title="y${i + 1} (m)">
        <button class="icon-btn" data-remove="${i}" title="Eliminar q${i + 1}">✕</button>
      </div>
    `).join('');
    list.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        const v = parseFloat(inp.value);
        if (!isFinite(v)) { inp.classList.add('invalid'); return; }
        inp.classList.remove('invalid');
        charges[parseInt(inp.parentElement.dataset.i)][inp.dataset.k] = v;
        if (inp.dataset.k === 'q') inp.style.borderLeftColor = v >= 0 ? '#3b82f6' : '#ef4444';
        updateGauss();
      });
    });
    list.querySelectorAll('[data-remove]').forEach(btn => {
      btn.onclick = () => { charges.splice(parseInt(btn.dataset.remove), 1); renderChargeList(); updateGauss(); };
    });
  }

  function caption(container, text) {
    const cap = document.createElement('div');
    cap.className = 'field-hint';
    cap.style.textAlign = 'center';
    cap.textContent = text;
    container.appendChild(cap);
  }

  function update() {
    const gauss = modeEl.value === 'gauss';
    body.querySelector('#f-plana').style.display = gauss ? 'none' : '';
    body.querySelector('#f-gauss').style.display = gauss ? '' : 'none';
    if (gauss) updateGauss(); else updatePlana();
  }

  body.querySelector('#f-add').onclick = () => {
    const vals = ['q', 'x', 'y'].map(k => {
      const inp = body.querySelector('#f-new-' + k);
      const v = parseFloat(inp.value);
      inp.classList.toggle('invalid', !isFinite(v));
      return v;
    });
    if (vals.some(v => !isFinite(v))) return;
    charges.push({ q: vals[0], x: vals[1], y: vals[2] });
    renderChargeList();
    updateGauss();
  };
  body.querySelector('#f-clear').onclick = () => { charges = []; renderChargeList(); updateGauss(); };

  UI.bind(body, ['f-e', 'f-a', 'f-b', 'f-rad', 'f-area', 'f-theta', 'f-size'], update);
  [modeEl, shapeEl, surfEl].forEach(el => el.addEventListener('change', update));

  renderChargeList();
  setRedraw(update);
  update();
}
