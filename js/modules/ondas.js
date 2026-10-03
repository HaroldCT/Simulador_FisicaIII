const ESPECTRO = [
  { name: 'Ondas de radio', min: 3e3, max: 3e9, color: '#ec4899' },
  { name: 'Microondas', min: 3e9, max: 3e11, color: '#8b5cf6' },
  { name: 'Infrarrojo', min: 3e11, max: 4e14, color: '#ef4444' },
  { name: 'Luz visible', min: 4e14, max: 7.9e14, color: '#16a34a' },
  { name: 'Ultravioleta', min: 7.9e14, max: 3e16, color: '#3b82f6' },
  { name: 'Rayos X', min: 3e16, max: 3e19, color: '#f59e0b' },
  { name: 'Rayos Gamma', min: 3e19, max: 3e22, color: '#8b93ad' },
];

function bandFor(f) {
  return ESPECTRO.find(b => f >= b.min && f < b.max) || ESPECTRO[ESPECTRO.length - 1];
}

function renderOndas(body) {
  const c = 3e8;
  body.innerHTML = `
    <div class="grid3">
      <div class="panel">
        <div class="panel-title">Parámetros</div>
        <div class="field">
          <label>Frecuencia (log₁₀ f) <span class="val" id="w-f-val">14.5 → 3.16×10¹⁴ Hz</span></label>
          <input type="range" id="w-fexp" min="6" max="19" step="0.05" value="14.5">
        </div>
        <div class="field">
          <label>Amplitud (E₀) <span class="val" id="w-e0-val">1.0</span></label>
          <input type="range" id="w-e0" min="0.2" max="2" step="0.05" value="1">
        </div>
        <button class="btn secondary" id="w-toggle">Pausar</button>
      </div>

      <div class="panel">
        <div class="panel-title">Onda electromagnética (E ⊥ B)</div>
        <div class="viz-box"><canvas id="w-canvas" width="380" height="230"></canvas></div>
        <div class="legend">
          <span style="color:#3b82f6"><i style="background:#3b82f6"></i> Campo eléctrico (E)</span>
          <span style="color:#ef4444"><i style="background:#ef4444"></i> Campo magnético (B)</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Resultados</div>
        <div class="formula-box">c = f · λ</div>
        <div class="result-row"><span class="result-label">Frecuencia (f)</span><span class="result-value" id="w-f">-</span></div>
        <div class="result-row"><span class="result-label">Longitud de onda (λ)</span><span class="result-value" id="w-lambda">-</span></div>
        <div class="result-row"><span class="result-label">Periodo (T)</span><span class="result-value" id="w-t">-</span></div>
        <div class="result-row"><span class="result-label">Velocidad (c)</span><span class="result-value">3.00×10⁸ m/s</span></div>
        <div class="result-row" style="margin-top:8px"><span class="result-label">Región del espectro</span></div>
        <div id="w-band" style="margin-top:4px"></div>
      </div>
    </div>
  `;

  const fEl = body.querySelector('#w-fexp');
  const e0El = body.querySelector('#w-e0');
  const toggleBtn = body.querySelector('#w-toggle');
  const canvas = body.querySelector('#w-canvas');
  const ctx = canvas.getContext('2d');

  let running = true;
  let phase = 0;
  let raf = null;
  let last = performance.now();

  function updateInfo() {
    const fexp = parseFloat(fEl.value);
    const f = Math.pow(10, fexp);
    const lambda = c / f;
    const T = 1 / f;
    const band = bandFor(f);

    body.querySelector('#w-f-val').textContent = `${fexp.toFixed(2)} → ${f.toExponential(2)} Hz`;
    body.querySelector('#w-e0-val').textContent = parseFloat(e0El.value).toFixed(2);
    body.querySelector('#w-f').textContent = `${f.toExponential(2)} Hz`;
    body.querySelector('#w-lambda').textContent = `${lambda.toExponential(2)} m`;
    body.querySelector('#w-t').textContent = `${T.toExponential(2)} s`;
    body.querySelector('#w-band').innerHTML = `<span class="badge" style="background:${band.color}22;color:${band.color}">${band.name}</span>`;
    return { f, lambda };
  }

  function draw() {
    const { lambda } = updateInfo();
    const e0 = parseFloat(e0El.value);
    const band = bandFor(Math.pow(10, parseFloat(fEl.value)));
    const theme = currentTheme();
    const W = canvas.width, H = canvas.height, midY = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = theme === 'dark' ? '#0f1524' : '#f4f6fb';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = theme === 'dark' ? '#232c42' : '#dbe0ee';
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();

    const cyclesShown = 3;
    const waveLenPx = W / cyclesShown;
    const amp = 55 * (e0 / 2 + 0.5) * 0.7;

    function drawWave(color, offset, ampY) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = midY - Math.sin((x / waveLenPx) * Math.PI * 2 + phase + offset) * ampY;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    drawWave('#3b82f6', 0, amp);
    drawWave('#ef4444', 0, amp * 0.6);

    ctx.fillStyle = band.color;
    ctx.font = '11px sans-serif';
    ctx.fillText(`λ visual (no a escala) · región: ${band.name}`, 8, 16);
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (running) phase += dt * 4;
    draw();
    raf = requestAnimationFrame(frame);
  }

  toggleBtn.onclick = () => {
    running = !running;
    toggleBtn.textContent = running ? 'Pausar' : 'Reanudar';
  };

  [fEl, e0El].forEach(el => el.addEventListener('input', () => { if (!running) draw(); }));

  raf = requestAnimationFrame(frame);
  const observer = new MutationObserver(() => {
    if (!document.body.contains(body)) { cancelAnimationFrame(raf); observer.disconnect(); }
  });
  observer.observe(document.getElementById('view'), { childList: true, subtree: true });
}
