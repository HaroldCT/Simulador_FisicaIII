// Controles de entrada reutilizables: número libre + slider sincronizado + unidad opcional.
const UI = (() => {

  // Genera el HTML de un campo. El valor escrito puede salir del rango del slider
  // (el slider se amplía); solo lo limitan lo/hi, que son restricciones físicas.
  function field({ id, label, unit = '', units = null, min, max, step = 'any', value, lo = -Infinity, hi = Infinity, loOpen = false, hint = '' }) {
    const unitHtml = units
      ? `<select id="${id}-unit">${units.map(u => `<option value="${u.f}"${u.sel ? ' selected' : ''}>${u.label}</option>`).join('')}</select>`
      : (unit ? `<span class="unit">${unit}</span>` : '');
    const slider = (min !== undefined && max !== undefined)
      ? `<input type="range" class="range-sync" id="${id}-range" min="${min}" max="${max}" step="${step}" value="${value}">`
      : '';
    return `
      <div class="field">
        <label for="${id}">${label}</label>
        <div class="num-row">
          <input type="number" id="${id}" value="${value}" step="any" data-lo="${lo}" data-hi="${hi}" data-lo-open="${loOpen ? 1 : 0}">
          ${unitHtml}
        </div>
        ${slider}
        ${hint ? `<div class="field-hint">${hint}</div>` : ''}
      </div>`;
  }

  function isValid(num, v) {
    const lo = parseFloat(num.dataset.lo), hi = parseFloat(num.dataset.hi);
    if (!isFinite(v)) return false;
    if (num.dataset.loOpen === '1' ? v <= lo : v < lo) return false;
    return v <= hi;
  }

  function syncSlider(rng, v) {
    if (!rng) return;
    if (v > parseFloat(rng.max)) rng.max = v;
    if (v < parseFloat(rng.min)) rng.min = v;
    rng.value = v;
  }

  function bind(root, ids, onChange) {
    ids.forEach(id => {
      const num = root.querySelector('#' + id);
      const rng = root.querySelector('#' + id + '-range');
      const unit = root.querySelector('#' + id + '-unit');
      num.dataset.last = num.value;
      if (rng) {
        rng.addEventListener('input', () => {
          num.value = rng.value;
          num.dataset.last = rng.value;
          num.classList.remove('invalid');
          onChange();
        });
      }
      num.addEventListener('input', () => {
        const v = parseFloat(num.value);
        if (!isValid(num, v)) { num.classList.add('invalid'); return; }
        num.classList.remove('invalid');
        num.dataset.last = v;
        syncSlider(rng, v);
        onChange();
      });
      if (unit) unit.addEventListener('change', onChange);
    });
  }

  // Valor en unidades SI (multiplicado por el factor de la unidad, si existe).
  function get(root, id) {
    const unit = root.querySelector('#' + id + '-unit');
    return raw(root, id) * (unit ? parseFloat(unit.value) : 1);
  }

  // Valor tal como lo ve el usuario (sin aplicar el factor de unidad).
  function raw(root, id) {
    const num = root.querySelector('#' + id);
    return parseFloat(num.dataset.last ?? num.value);
  }

  function unitLabel(root, id) {
    const unit = root.querySelector('#' + id + '-unit');
    return unit ? unit.selectedOptions[0].textContent : '';
  }

  function set(root, id, value, unitFactor) {
    const num = root.querySelector('#' + id);
    num.value = value;
    num.dataset.last = value;
    num.classList.remove('invalid');
    syncSlider(root.querySelector('#' + id + '-range'), value);
    const unit = root.querySelector('#' + id + '-unit');
    if (unit && unitFactor !== undefined) unit.value = String(unitFactor);
  }

  const CHARGE_UNITS = [
    { label: 'nC', f: 1e-9 }, { label: 'µC', f: 1e-6, sel: true }, { label: 'mC', f: 1e-3 }, { label: 'C', f: 1 },
  ];
  const LENGTH_UNITS = [
    { label: 'mm', f: 1e-3 }, { label: 'cm', f: 1e-2 }, { label: 'm', f: 1, sel: true }, { label: 'km', f: 1e3 },
  ];

  return { field, bind, get, raw, set, unitLabel, CHARGE_UNITS, LENGTH_UNITS };
})();

// Fórmulas con notación matemática natural, sin librerías externas.
// Sintaxis: [num] / [den] fracción · x^2, x^{−t/RC} superíndice · q_1, V_{C} subíndice
//           "texto" texto recto · sqrt[...] raíz · funciones (sen, cos, ln...) en recto.
const M = (() => {
  const FUNCS = ['sen', 'sin', 'cos', 'tan', 'ln', 'log', 'exp', 'max', 'min', 'enc', 'neta', 'total'];
  const esc = c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c);

  function matching(s, i, open, close) {
    let depth = 0;
    for (let j = i; j < s.length; j++) {
      if (s[j] === open) depth++;
      else if (s[j] === close && --depth === 0) return j;
    }
    return s.length;
  }

  function script(s, i) {
    // devuelve [contenido, índice siguiente] para ^x, ^{...}, ^123
    if (s[i] === '{') { const j = matching(s, i, '{', '}'); return [s.slice(i + 1, j), j + 1]; }
    let j = i + 1;
    if (/[0-9]/.test(s[i])) while (j < s.length && /[0-9]/.test(s[j])) j++;
    return [s.slice(i, j), j];
  }

  function parse(s) {
    let out = '';
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '[') {
        const j = matching(s, i, '[', ']');
        const num = s.slice(i + 1, j);
        let k = j + 1;
        while (s[k] === ' ') k++;
        if (s[k] === '/') {
          k++;
          while (s[k] === ' ') k++;
          if (s[k] === '[') {
            const j2 = matching(s, k, '[', ']');
            out += `<span class="frac"><span>${parse(num)}</span><span>${parse(s.slice(k + 1, j2))}</span></span>`;
            i = j2 + 1;
            continue;
          }
        }
        out += parse(num);
        i = j + 1;
      } else if (c === '^' || c === '_') {
        const [content, next] = script(s, i + 1);
        out += c === '^' ? `<sup>${parse(content)}</sup>` : `<sub>${parse(content)}</sub>`;
        i = next;
      } else if (c === '"') {
        const j = s.indexOf('"', i + 1);
        out += `<span class="mtext">${s.slice(i + 1, j < 0 ? s.length : j)}</span>`;
        i = j < 0 ? s.length : j + 1;
      } else if (s.startsWith('sqrt[', i)) {
        const j = matching(s, i + 4, '[', ']');
        out += `<span class="msqrt">√<span>${parse(s.slice(i + 5, j))}</span></span>`;
        i = j + 1;
      } else if (/[A-Za-z]/.test(c)) {
        let j = i;
        while (j < s.length && /[A-Za-z]/.test(s[j])) j++;
        const word = s.slice(i, j);
        out += FUNCS.includes(word) ? `<span class="mfn">${word}</span>` : word.split('').map(l => `<i>${l}</i>`).join('');
        i = j;
      } else if (/[α-ωϕ]/.test(c)) {
        out += `<i>${c}</i>`; i++;
      } else if (c === '=' || c === '≈' || c === '∝') {
        out += `<span class="mop">${c}</span>`; i++;
      } else if (c === '-') {
        out += '−'; i++;
      } else if (c === '{' || c === '}') {
        i++;
      } else {
        out += esc(c); i++;
      }
    }
    return out;
  }

  function eq(s) { return `<span class="math">${parse(s)}</span>`; }

  return { eq, parse };
})();
