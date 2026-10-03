function renderOhm(body) {
  body.innerHTML = `
    <div class="grid3">
      <div class="panel">
        <div class="panel-title">Parámetros</div>

        <div class="field">
          <label>Configuración</label>
          <select id="o-mode">
            <option value="serie">Serie</option>
            <option value="paralelo">Paralelo</option>
          </select>
        </div>

        <div class="field">
          <label>Voltaje de la fuente (V) <span class="val" id="o-v-val">12.0 V</span></label>
          <input type="range" id="o-v" min="1" max="24" step="0.5" value="12">
        </div>
        <div class="field">
          <label>Resistencia R₁ <span class="val" id="o-r1-val">100 Ω</span></label>
          <input type="range" id="o-r1" min="1" max="1000" step="1" value="100">
        </div>
        <div class="field">
          <label>Resistencia R₂ <span class="val" id="o-r2-val">220 Ω</span></label>
          <input type="range" id="o-r2" min="1" max="1000" step="1" value="220">
        </div>
        <div class="field">
          <label>Resistencia R₃ <span class="val" id="o-r3-val">330 Ω</span></label>
          <input type="range" id="o-r3" min="1" max="1000" step="1" value="330">
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Circuito</div>
        <div class="viz-box"><svg id="o-viz" width="100%" height="230" viewBox="0 0 380 230"></svg></div>
        <div class="note-box info-note show">
          <b>Ley de Ohm:</b> V = I·R &nbsp;·&nbsp; <b>Kirchhoff:</b> en serie I es igual en todo el circuito y las caídas de voltaje suman V; en paralelo el voltaje es igual en cada rama y las corrientes suman I total.
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Resultados</div>
        <div class="formula-box">V = I · R</div>
        <div class="result-row"><span class="result-label">Resistencia total</span><span class="result-value" id="o-rt">-</span></div>
        <div class="result-row"><span class="result-label">Corriente total (I)</span><span class="result-value big" id="o-it">-</span></div>
        <div class="result-row"><span class="result-label">Potencia total</span><span class="result-value" id="o-pt">-</span></div>
        <div class="panel-title" style="margin-top:14px">Por resistencia</div>
        <div id="o-per"></div>
      </div>
    </div>
  `;

  const els = ['o-mode', 'o-v', 'o-r1', 'o-r2', 'o-r3'].map(id => body.querySelector('#' + id));
  const [modeEl, vEl, r1El, r2El, r3El] = els;

  function drawCircuit(mode, v, rs, currents) {
    const svgEl = body.querySelector('#o-viz');
    svgEl.innerHTML = '';
    const W = 380, H = 230;
    function line(x1, y1, x2, y2, color = 'currentColor') {
      svgEl.appendChild(Charts.svg('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': 2 }));
    }
    function resistorBox(cx, cy, label, vertical) {
      const w = 46, h = 22;
      const x = vertical ? cx - h / 2 : cx - w / 2;
      const y = vertical ? cy - w / 2 : cy - h / 2;
      const rw = vertical ? h : w, rh = vertical ? w : h;
      svgEl.appendChild(Charts.svg('rect', { x, y, width: rw, height: rh, rx: 4, fill: 'none', stroke: '#f59e0b', 'stroke-width': 2 }));
      const t = Charts.svg('text', { x: cx, y: vertical ? cy : cy - h / 2 - 6, fill: 'currentColor', 'font-size': 11, 'text-anchor': 'middle' });
      t.textContent = label;
      svgEl.appendChild(t);
    }
    function battery(cx, cy) {
      line(cx - 4, cy - 16, cx - 4, cy + 16, '#3b82f6');
      line(cx + 4, cy - 9, cx + 4, cy + 9, '#3b82f6');
      const t = Charts.svg('text', { x: cx, y: cy + 32, fill: 'currentColor', 'font-size': 11, 'text-anchor': 'middle' });
      t.textContent = `${v.toFixed(1)} V`;
      svgEl.appendChild(t);
    }

    if (mode === 'serie') {
      const y = 60;
      line(40, y, 40, 170); line(40, 170, 340, 170); line(340, 170, 340, y);
      battery(40, 115);
      const n = rs.length;
      const spacing = 300 / (n + 1);
      rs.forEach((r, i) => {
        const cx = 40 + spacing * (i + 1);
        line(i === 0 ? 40 : 40 + spacing * i, y, cx - 23, y);
        resistorBox(cx, y, `R${i + 1}=${r}Ω`, false);
        line(cx + 23, y, i === n - 1 ? 340 : 40 + spacing * (i + 2), y);
      });
      const it = Charts.svg('text', { x: 190, y: 45, fill: '#16a34a', 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700 });
      it.textContent = `I = ${Charts.fmt(currents[0], 3)} A`;
      svgEl.appendChild(it);
    } else {
      const left = 60, right = 320, top = 40, bottom = 190;
      line(left, (top + bottom) / 2 - 55, left, bottom);
      line(left, bottom, right, bottom);
      line(right, bottom, right, (top + bottom) / 2 - 55);
      battery(left, (top + bottom) / 2);
      const n = rs.length;
      const step = (bottom - top) / (n + 1);
      rs.forEach((r, i) => {
        const y = top + step * (i + 1);
        line(left, y, left + 40, y);
        resistorBox(left + 80, y, `R${i + 1}=${r}Ω`, true);
        line(left + 120, y, right, y);
        const t = Charts.svg('text', { x: left + 80, y: y + 34, fill: '#16a34a', 'font-size': 10, 'text-anchor': 'middle' });
        t.textContent = `I${i + 1}=${Charts.fmt(currents[i], 3)}A`;
        svgEl.appendChild(t);
      });
      line(left, top, left, top + step - 20);
    }
  }

  function update() {
    const mode = modeEl.value;
    const v = parseFloat(vEl.value);
    const rs = [parseFloat(r1El.value), parseFloat(r2El.value), parseFloat(r3El.value)];

    body.querySelector('#o-v-val').textContent = `${v.toFixed(1)} V`;
    body.querySelector('#o-r1-val').textContent = `${rs[0]} Ω`;
    body.querySelector('#o-r2-val').textContent = `${rs[1]} Ω`;
    body.querySelector('#o-r3-val').textContent = `${rs[2]} Ω`;

    let rt, it, currents, drops;
    if (mode === 'serie') {
      rt = rs.reduce((a, b) => a + b, 0);
      it = v / rt;
      currents = rs.map(() => it);
      drops = rs.map(r => it * r);
    } else {
      rt = 1 / rs.reduce((a, b) => a + 1 / b, 0);
      it = v / rt;
      currents = rs.map(r => v / r);
      drops = rs.map(() => v);
    }
    const pt = v * it;

    body.querySelector('#o-rt').textContent = `${Charts.fmt(rt, 2)} Ω`;
    body.querySelector('#o-it').textContent = `${Charts.fmt(it, 3)} A`;
    body.querySelector('#o-pt').textContent = `${Charts.fmt(pt, 2)} W`;

    body.querySelector('#o-per').innerHTML = rs.map((r, i) => `
      <div class="result-row">
        <span class="result-label">R${i + 1} (${r} Ω)</span>
        <span class="result-value">I=${Charts.fmt(currents[i], 3)}A · V=${Charts.fmt(drops[i], 2)}V</span>
      </div>
    `).join('');

    drawCircuit(mode, v, rs, currents);
  }

  els.forEach(el => el.addEventListener('input', update));
  modeEl.addEventListener('change', update);
  update();
}
