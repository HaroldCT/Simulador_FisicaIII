// Utilidades compartidas: gráficas SVG y helpers de dibujo vectorial.
const Charts = (() => {

  function svg(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  // Dibuja una curva y=f(x) en un SVG dado un rango [x0,x1], num puntos, tamaño.
  function lineChart({ width = 300, height = 180, xLabel = 'x', yLabel = 'y', series, xMin, xMax, yMin, yMax, xTicks = [], theme = 'dark' }) {
    const pad = { l: 40, r: 14, t: 14, b: 28 };
    const w = width - pad.l - pad.r;
    const h = height - pad.t - pad.b;
    const gridColor = theme === 'dark' ? '#232c42' : '#e2e6f0';
    const textColor = theme === 'dark' ? '#8b93ad' : '#5b6478';

    const sx = x => pad.l + ((x - xMin) / (xMax - xMin || 1)) * w;
    const sy = y => pad.t + h - ((y - yMin) / (yMax - yMin || 1)) * h;

    const root = svg('svg', { width, height, viewBox: `0 0 ${width} ${height}` });

    // grid horizontal lines (5)
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (h / 4) * i;
      root.appendChild(svg('line', { x1: pad.l, y1: y, x2: pad.l + w, y2: y, stroke: gridColor, 'stroke-width': 1 }));
      const val = yMax - (yMax - yMin) * (i / 4);
      const t = svg('text', { x: pad.l - 6, y: y + 3, fill: textColor, 'font-size': 9, 'text-anchor': 'end' });
      t.textContent = tick(val);
      root.appendChild(t);
    }
    // axis
    root.appendChild(svg('line', { x1: pad.l, y1: pad.t, x2: pad.l, y2: pad.t + h, stroke: gridColor, 'stroke-width': 1.4 }));
    root.appendChild(svg('line', { x1: pad.l, y1: pad.t + h, x2: pad.l + w, y2: pad.t + h, stroke: gridColor, 'stroke-width': 1.4 }));

    xTicks.forEach(xt => {
      const x = sx(xt);
      const t = svg('text', { x, y: pad.t + h + 16, fill: textColor, 'font-size': 9, 'text-anchor': 'middle' });
      t.textContent = typeof xt === 'number' ? tick(xt) : xt;
      root.appendChild(t);
    });

    series.forEach(s => {
      const pts = s.points;
      let d = '';
      pts.forEach((p, i) => {
        const cmd = i === 0 ? 'M' : 'L';
        d += `${cmd}${sx(p[0]).toFixed(2)},${sy(p[1]).toFixed(2)} `;
      });
      root.appendChild(svg('path', {
        d, fill: 'none', stroke: s.color, 'stroke-width': 2,
        'stroke-dasharray': s.dashed ? '5,4' : 'none'
      }));
      if (s.point) {
        root.appendChild(svg('circle', { cx: sx(s.point[0]), cy: sy(s.point[1]), r: 4, fill: s.color }));
      }
    });

    return root;
  }

  function round(v, d = 2) {
    if (!isFinite(v)) return '0';
    return Number(v.toFixed(d)).toString();
  }

  // Etiqueta corta para ejes: notación científica solo cuando hace falta.
  function tick(v) {
    if (!isFinite(v)) return '0';
    const a = Math.abs(v);
    if (a === 0 || a < 1e-12) return '0';
    if (a >= 1e4 || a < 1e-2) return v.toExponential(1).replace('e+', 'e');
    return Number(v.toPrecision(3)).toString();
  }

  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };

  // Formato legible con notación científica (×10ⁿ) para valores muy grandes o pequeños.
  function sci(v, unit = '', d = 3) {
    if (v === null || v === undefined || isNaN(v)) return '-';
    if (!isFinite(v)) return '∞' + (unit ? ' ' + unit : '');
    const a = Math.abs(v);
    let out;
    if (a === 0) out = '0';
    else if (a >= 1e4 || a < 1e-2) {
      const [m, e] = v.toExponential(d - 1).split('e');
      out = `${m}×10${e.replace('+', '').split('').map(c => SUP[c]).join('')}`;
    } else {
      out = Number(v.toPrecision(d + 1)).toString();
    }
    return unit ? `${out} ${unit}` : out;
  }

  function fmt(v, d = 2) {
    if (v === null || v === undefined || isNaN(v)) return '-';
    return Number(v.toFixed(d)).toLocaleString('es-CO', { maximumFractionDigits: d });
  }

  return { svg, lineChart, round, fmt, sci, tick };
})();
