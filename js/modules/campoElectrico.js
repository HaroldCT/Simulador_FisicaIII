function renderCampoElectrico(body) {
  const K = 8.99e9;
  let charges = [
    { q: 5, x: 0, y: 0 },
    { q: -5, x: 1, y: 0 },
  ];
  let dragIndex = -1;
  let infoPoint = { x: 0.5, y: 0.3 };
  const opts = { lines: true, equip: true, vectors: false, values: false };

  const W = 380, H = 300;
  const domain = { xmin: -2, xmax: 2, ymin: -1.6, ymax: 1.6 };
  const span = () => domain.xmax - domain.xmin;

  // Ajusta el plano para que todas las cargas y el punto P queden visibles.
  function fitDomain() {
    let half = 2;
    charges.concat([infoPoint]).forEach(p => {
      half = Math.max(half, Math.abs(p.x) * 1.2, Math.abs(p.y) * 1.2 * W / H);
    });
    domain.xmin = -half; domain.xmax = half;
    domain.ymin = -half * H / W; domain.ymax = half * H / W;
  }

  body.innerHTML = `
    <div class="grid3">
      <div class="panel">
        <div class="panel-title">Configuración</div>
        <div class="field">
          <label>Añadir carga</label>
          <div class="charge-grid head"><span>q (µC)</span><span>x (m)</span><span>y (m)</span><span></span></div>
          <div class="charge-grid">
            <input type="number" id="e-new-q" value="5" step="any">
            <input type="number" id="e-new-x" value="0" step="any">
            <input type="number" id="e-new-y" value="0.8" step="any">
            <button class="btn" id="e-add" title="Añadir carga">+</button>
          </div>
        </div>
        <div class="field">
          <label>Cargas en el plano (editables)</label>
          <div id="e-charge-list"></div>
        </div>
        <div class="field">
          <label>Punto de evaluación P (x, y en m)</label>
          <div class="charge-grid two">
            <input type="number" id="e-px" step="any" title="x de P">
            <input type="number" id="e-py" step="any" title="y de P">
          </div>
          <div class="field-hint">También puedes hacer clic en el plano. Arrastra las cargas para moverlas.</div>
        </div>
        ${UI.field({ id: 'e-q0', label: 'Carga de prueba en P (q₀)', units: UI.CHARGE_UNITS, value: 1 })}
        <button class="btn secondary" id="e-clear">Limpiar todo</button>
      </div>

      <div class="panel">
        <div class="panel-title">Vista del plano</div>
        <div class="viz-box" style="min-height:auto;padding:6px">
          <canvas id="e-canvas" width="${W}" height="${H}" style="cursor:crosshair;touch-action:none"></canvas>
        </div>
        <div class="formula-box" style="font-size:20px">${M.eq('E = Σ [k q_i] / [r_i^2] r̂_i')}  ·  ${M.eq('V = Σ [k q_i] / [r_i]')}</div>
      </div>

      <div class="panel">
        <div class="panel-title">Información en el punto P</div>
        <div class="result-row"><span class="result-label">Posición</span><span class="result-value" id="e-pos">-</span></div>
        <div class="result-row"><span class="result-label">Campo eléctrico |E|</span><span class="result-value" id="e-mag">-</span></div>
        <div class="result-row"><span class="result-label">Componentes (Eₓ, Eᵧ)</span><span class="result-value" id="e-comp">-</span></div>
        <div class="result-row"><span class="result-label">Dirección</span><span class="result-value" id="e-dir">-</span></div>
        <div class="result-row"><span class="result-label">Potencial eléctrico</span><span class="result-value" id="e-pot">-</span></div>
        <div class="result-row"><span class="result-label">Fuerza sobre q₀ (|q₀|E)</span><span class="result-value" id="e-force">-</span></div>
        <div class="result-row"><span class="result-label">Energía de q₀ (q₀V)</span><span class="result-value" id="e-u">-</span></div>

        <div class="panel-title" style="margin-top:16px">Leyenda</div>
        <div class="legend">
          <span><i style="background:#8b93ad;height:1px"></i> Línea de campo</span>
          <span><i style="border-top:2px dashed #8b93ad;background:none"></i> Equipotencial</span>
          <span style="color:#3b82f6">● Carga positiva</span>
          <span style="color:#ef4444">● Carga negativa</span>
        </div>

        <div class="panel-title" style="margin-top:16px">Opciones de visualización</div>
        <div class="checkline"><input type="checkbox" id="e-opt-lines" checked> Líneas de campo</div>
        <div class="checkline"><input type="checkbox" id="e-opt-equip" checked> Equipotenciales</div>
        <div class="checkline"><input type="checkbox" id="e-opt-vectors"> Vectores de campo</div>
        <div class="checkline"><input type="checkbox" id="e-opt-values"> Mapa de potencial</div>
      </div>
    </div>
  `;

  const canvas = body.querySelector('#e-canvas');
  const ctx = canvas.getContext('2d');

  function toPx(x, y) {
    return [
      ((x - domain.xmin) / span()) * W,
      H - ((y - domain.ymin) / (domain.ymax - domain.ymin)) * H,
    ];
  }
  function toWorld(px, py) {
    return [
      domain.xmin + (px / W) * span(),
      domain.ymin + ((H - py) / H) * (domain.ymax - domain.ymin),
    ];
  }

  function fieldAt(x, y) {
    let ex = 0, ey = 0, v = 0;
    const rMin = span() * 0.015; // evita la singularidad sobre la carga
    for (const c of charges) {
      const dx = x - c.x, dy = y - c.y;
      const rc = Math.max(Math.hypot(dx, dy), rMin);
      const qc = c.q * 1e-6;
      const mag = K * qc / (rc * rc);
      ex += mag * (dx / rc);
      ey += mag * (dy / rc);
      v += K * qc / rc;
    }
    return { ex, ey, v };
  }

  function color(theme) {
    return theme === 'dark'
      ? { grid: '#232c42', text: '#8b93ad', bg: '#0f1524' }
      : { grid: '#dbe0ee', text: '#5b6478', bg: '#f4f6fb' };
  }

  function draw() {
    const C = color(currentTheme());
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    if (opts.values) drawPotentialField();

    // cuadrícula con paso adaptado a la escala
    const raw = span() / 4;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const gstep = [1, 2, 5, 10].map(m => m * pow).find(v => v >= raw);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.font = '9px sans-serif';
    ctx.fillStyle = C.text;
    for (let x = Math.ceil(domain.xmin / gstep) * gstep; x <= domain.xmax; x += gstep) {
      const [px] = toPx(x, 0);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
      ctx.fillText(Charts.tick(x), px + 2, H - 4);
    }
    for (let y = Math.ceil(domain.ymin / gstep) * gstep; y <= domain.ymax; y += gstep) {
      const [, py] = toPx(0, y);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
      ctx.fillText(Charts.tick(y), 2, py - 2);
    }

    if (charges.length) {
      if (opts.equip) drawEquipotentials(C);
      if (opts.lines) drawFieldLines(C);
      if (opts.vectors) drawFieldVectors();
    }

    charges.forEach((c, i) => {
      const [px, py] = toPx(c.x, c.y);
      ctx.beginPath();
      ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.fillStyle = c.q > 0 ? '#3b82f6' : c.q < 0 ? '#ef4444' : '#8b93ad';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.q > 0 ? '+' : c.q < 0 ? '−' : '0', px, py + 4);
      ctx.fillStyle = C.text;
      ctx.font = '10px sans-serif';
      ctx.fillText(`q${i + 1}`, px, py - 15);
      ctx.textAlign = 'left';
    });

    // punto P
    const [ipx, ipy] = toPx(infoPoint.x, infoPoint.y);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ipx - 6, ipy); ctx.lineTo(ipx + 6, ipy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ipx, ipy - 6); ctx.lineTo(ipx, ipy + 6); ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('P', ipx + 6, ipy + 13);

    const f = fieldAt(infoPoint.x, infoPoint.y);
    const mag = Math.hypot(f.ex, f.ey);
    if (mag > 0) {
      const ux = f.ex / mag, uy = f.ey / mag;
      drawArrow(ipx, ipy, ipx + ux * 30, ipy - uy * 30, '#f59e0b');
    }
  }

  function drawArrow(x1, y1, x2, y2, c) {
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 6 * Math.cos(ang - 0.4), y2 - 6 * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - 6 * Math.cos(ang + 0.4), y2 - 6 * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  function drawFieldVectors() {
    const nx = 12, ny = 9;
    const pts = [];
    let ref = 0;
    for (let i = 1; i < nx; i++) {
      for (let j = 1; j < ny; j++) {
        const x = domain.xmin + (i / nx) * span();
        const y = domain.ymin + (j / ny) * (domain.ymax - domain.ymin);
        const f = fieldAt(x, y);
        const mag = Math.hypot(f.ex, f.ey);
        ref = Math.max(ref, mag);
        pts.push({ x, y, f, mag });
      }
    }
    pts.forEach(({ x, y, f, mag }) => {
      if (mag <= 0) return;
      // longitud logarítmica relativa al campo más intenso de la malla
      const len = 5 + 13 * Math.max(0, 1 + Math.log10(mag / ref) / 3);
      const [px, py] = toPx(x, y);
      drawArrow(px, py, px + (f.ex / mag) * len, py - (f.ey / mag) * len, '#60a5fa');
    });
  }

  function drawFieldLines(C) {
    ctx.strokeStyle = C.text;
    ctx.lineWidth = 1.1;
    const positives = charges.filter(c => c.q > 0);
    const starts = positives.length ? positives : charges.filter(c => c.q < 0);
    if (!starts.length) return;
    const qMax = Math.max(...starts.map(c => Math.abs(c.q)));
    const r0 = span() * 0.022;
    starts.forEach(c => {
      // densidad de líneas proporcional a la magnitud de la carga
      const n = Math.max(4, Math.round(14 * Math.abs(c.q) / qMax));
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2;
        traceLine(c.x + Math.cos(ang) * r0, c.y + Math.sin(ang) * r0, c.q > 0 ? 1 : -1);
      }
    });
  }

  function traceLine(x, y, dir) {
    ctx.beginPath();
    let [px, py] = toPx(x, y);
    ctx.moveTo(px, py);
    const step = span() * 0.0075;
    const hitR = span() * 0.02;
    for (let i = 0; i < 700; i++) {
      const f = fieldAt(x, y);
      const mag = Math.hypot(f.ex, f.ey);
      if (mag === 0) break;
      x += (f.ex / mag) * step * dir;
      y += (f.ey / mag) * step * dir;
      if (x < domain.xmin || x > domain.xmax || y < domain.ymin || y > domain.ymax) break;
      const hit = charges.some(c => c.q !== 0 && Math.hypot(x - c.x, y - c.y) < hitR);
      [px, py] = toPx(x, y);
      ctx.lineTo(px, py);
      if (hit) break;
    }
    ctx.stroke();
  }

  function drawPotentialField() {
    const cell = 6;
    // escala: potencial de la carga más grande a ~15% del ancho del plano
    let maxAbs = 0;
    for (const c of charges) maxAbs = Math.max(maxAbs, K * Math.abs(c.q) * 1e-6 / (span() * 0.15));
    if (maxAbs === 0) return;
    for (let px = 0; px < W; px += cell) {
      for (let py = 0; py < H; py += cell) {
        const [x, y] = toWorld(px + cell / 2, py + cell / 2);
        const t = Math.max(-1, Math.min(1, fieldAt(x, y).v / maxAbs));
        ctx.fillStyle = t >= 0
          ? `rgba(59,130,246,${Math.abs(t) * 0.55})`
          : `rgba(239,68,68,${Math.abs(t) * 0.55})`;
        ctx.fillRect(px, py, cell, cell);
      }
    }
  }

  function drawEquipotentials(C) {
    const cols = 46, rows = 36;
    const grid = [];
    for (let j = 0; j <= rows; j++) {
      const row = [];
      for (let i = 0; i <= cols; i++) {
        const x = domain.xmin + (i / cols) * span();
        const y = domain.ymin + (j / rows) * (domain.ymax - domain.ymin);
        row.push(fieldAt(x, y).v);
      }
      grid.push(row);
    }
    let maxAbs = 0;
    grid.forEach(row => row.forEach(v => { if (isFinite(v)) maxAbs = Math.max(maxAbs, Math.abs(v)); }));
    if (maxAbs === 0) return;
    const levels = [-0.6, -0.3, -0.12, 0.12, 0.3, 0.6].map(f => f * maxAbs);

    ctx.strokeStyle = C.text;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    levels.forEach(level => {
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x0 = domain.xmin + (i / cols) * span();
          const x1 = domain.xmin + ((i + 1) / cols) * span();
          const y0 = domain.ymin + (j / rows) * (domain.ymax - domain.ymin);
          const y1 = domain.ymin + ((j + 1) / rows) * (domain.ymax - domain.ymin);
          const vTL = grid[j][i], vTR = grid[j][i + 1], vBR = grid[j + 1][i + 1], vBL = grid[j + 1][i];
          const pts = [];
          const edges = [
            [vTL, vTR, [x0, y0], [x1, y0]],
            [vTR, vBR, [x1, y0], [x1, y1]],
            [vBR, vBL, [x1, y1], [x0, y1]],
            [vBL, vTL, [x0, y1], [x0, y0]],
          ];
          edges.forEach(([a, b, pa, pb]) => {
            if ((a - level) * (b - level) < 0) {
              const t = (level - a) / (b - a);
              pts.push([pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t]);
            }
          });
          if (pts.length >= 2) {
            const [p1x, p1y] = toPx(pts[0][0], pts[0][1]);
            const [p2x, p2y] = toPx(pts[1][0], pts[1][1]);
            ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.stroke();
          }
        }
      }
    });
    ctx.setLineDash([]);
  }

  function updateInfoPanel() {
    const f = fieldAt(infoPoint.x, infoPoint.y);
    const mag = Math.hypot(f.ex, f.ey);
    const angle = ((Math.atan2(f.ey, f.ex) * 180 / Math.PI) + 360) % 360;
    const q0 = UI.get(body, 'e-q0');
    body.querySelector('#e-pos').textContent = `(${Charts.sci(infoPoint.x)}, ${Charts.sci(infoPoint.y)}) m`;
    body.querySelector('#e-mag').textContent = Charts.sci(mag, 'N/C');
    body.querySelector('#e-comp').textContent = `(${Charts.sci(f.ex)}, ${Charts.sci(f.ey)}) N/C`;
    body.querySelector('#e-dir').textContent = mag > 0 ? `${angle.toFixed(1)}°` : '-';
    body.querySelector('#e-pot').textContent = Charts.sci(f.v, 'V');
    body.querySelector('#e-force').textContent = Charts.sci(Math.abs(q0) * mag, 'N');
    body.querySelector('#e-u').textContent = Charts.sci(q0 * f.v, 'J');
    const px = body.querySelector('#e-px'), py = body.querySelector('#e-py');
    if (document.activeElement !== px) px.value = +infoPoint.x.toFixed(4);
    if (document.activeElement !== py) py.value = +infoPoint.y.toFixed(4);
  }

  function renderChargeList() {
    const list = body.querySelector('#e-charge-list');
    if (!charges.length) { list.innerHTML = '<div class="result-label">Sin cargas</div>'; return; }
    list.innerHTML = charges.map((c, i) => `
      <div class="charge-grid" data-i="${i}">
        <input type="number" step="any" data-k="q" value="${c.q}" title="q${i + 1} (µC)" style="border-left:3px solid ${c.q >= 0 ? '#3b82f6' : '#ef4444'}">
        <input type="number" step="any" data-k="x" value="${+c.x.toFixed(4)}" title="x${i + 1} (m)">
        <input type="number" step="any" data-k="y" value="${+c.y.toFixed(4)}" title="y${i + 1} (m)">
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
        fitDomain(); draw(); updateInfoPanel();
      });
    });
    list.querySelectorAll('[data-remove]').forEach(btn => {
      btn.onclick = () => {
        charges.splice(parseInt(btn.dataset.remove), 1);
        refresh();
      };
    });
  }

  function refresh() { fitDomain(); renderChargeList(); draw(); updateInfoPanel(); }

  body.querySelector('#e-add').onclick = () => {
    const vals = ['q', 'x', 'y'].map(k => {
      const inp = body.querySelector('#e-new-' + k);
      const v = parseFloat(inp.value);
      inp.classList.toggle('invalid', !isFinite(v));
      return v;
    });
    if (vals.some(v => !isFinite(v))) return;
    charges.push({ q: vals[0], x: vals[1], y: vals[2] });
    refresh();
  };
  body.querySelector('#e-clear').onclick = () => { charges = []; refresh(); };

  ['x', 'y'].forEach(k => {
    const inp = body.querySelector('#e-p' + k);
    inp.addEventListener('input', () => {
      const v = parseFloat(inp.value);
      if (!isFinite(v)) { inp.classList.add('invalid'); return; }
      inp.classList.remove('invalid');
      infoPoint[k] = v;
      fitDomain(); draw(); updateInfoPanel();
    });
  });
  UI.bind(body, ['e-q0'], updateInfoPanel);

  ['lines', 'equip', 'vectors', 'values'].forEach(k => {
    body.querySelector(`#e-opt-${k}`).addEventListener('change', e => {
      opts[k] = e.target.checked;
      draw();
    });
  });

  function eventToWorld(e) {
    const rect = canvas.getBoundingClientRect();
    return toWorld((e.clientX - rect.left) * (W / rect.width), (e.clientY - rect.top) * (H / rect.height));
  }

  // eventos de puntero: funcionan con ratón y pantalla táctil
  canvas.addEventListener('pointerdown', e => {
    const [wx, wy] = eventToWorld(e);
    let hit = -1;
    charges.forEach((c, i) => { if (Math.hypot(c.x - wx, c.y - wy) < span() * 0.04) hit = i; });
    if (hit >= 0) {
      dragIndex = hit;
      canvas.setPointerCapture(e.pointerId);
    } else {
      infoPoint = { x: wx, y: wy };
      draw(); updateInfoPanel();
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (dragIndex < 0) return;
    const [wx, wy] = eventToWorld(e);
    charges[dragIndex].x = Math.max(domain.xmin, Math.min(domain.xmax, wx));
    charges[dragIndex].y = Math.max(domain.ymin, Math.min(domain.ymax, wy));
    draw();
    updateInfoPanel();
  });
  canvas.addEventListener('pointerup', () => {
    if (dragIndex >= 0) { dragIndex = -1; renderChargeList(); }
  });

  setRedraw(draw);
  refresh();
}
