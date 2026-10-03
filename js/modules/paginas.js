// ---------- Teoría ----------
function renderTeoria() {
  const view = document.getElementById('view');
  view.innerHTML = `<div class="screen-header"><div class="screen-header-left"><div class="screen-title">Teoría</div></div></div>`;

  // f: [expresión en sintaxis M.eq, etiqueta]
  const temas = [
    {
      t: 'Electrostática',
      d: 'La Ley de Coulomb describe la fuerza entre dos cargas puntuales: es proporcional al producto de las cargas e inversamente proporcional al cuadrado de la distancia. El campo eléctrico es la fuerza por unidad de carga positiva de prueba, y el potencial eléctrico es la energía potencial por unidad de carga.',
      f: [
        ['F = [k |q_1 q_2|] / [r^2]', 'Ley de Coulomb'],
        ['k = [1] / [4π ε_0] ≈ 8.99 × 10^9 "N·m²/C²"', 'Constante de Coulomb'],
        ['E = [F] / [q_0] = [k q] / [r^2]', 'Campo de una carga puntual'],
        ['V = [k q] / [r]', 'Potencial eléctrico'],
        ['U = [k q_1 q_2] / [r]', 'Energía potencial'],
      ],
    },
    {
      t: 'Flujo eléctrico y Ley de Gauss',
      d: 'El flujo eléctrico mide cuántas líneas de campo atraviesan una superficie. Para una superficie plana en un campo uniforme depende del ángulo entre E y el vector normal. La Ley de Gauss establece que el flujo total a través de cualquier superficie cerrada es proporcional a la carga neta encerrada; las cargas exteriores no aportan flujo neto.',
      f: [
        ['Φ_E = E A cos θ', 'Superficie plana, campo uniforme'],
        ['Φ_E = ∫ E · dA', 'Definición general'],
        ['∮ E · dA = [q_{enc}] / [ε_0]', 'Ley de Gauss'],
        ['ε_0 = 8.85 × 10^{-12} "C²/N·m²"', 'Permitividad del vacío'],
        ['E = [q] / [4π ε_0 r^2]', 'Gauss con simetría esférica'],
      ],
    },
    {
      t: 'Circuitos (Ohm y Kirchhoff)',
      d: 'La Ley de Ohm relaciona voltaje, corriente y resistencia. Las leyes de Kirchhoff garantizan la conservación de la carga (ley de nodos) y de la energía (ley de mallas) en cualquier circuito.',
      f: [
        ['V = I R', 'Ley de Ohm'],
        ['Σ I_{"entra"} = Σ I_{"sale"}', 'Ley de nodos'],
        ['Σ V = 0', 'Ley de mallas'],
        ['P = V I = I^2 R', 'Potencia eléctrica'],
      ],
    },
    {
      t: 'Circuito RC',
      d: 'En un circuito RC, el capacitor se carga o descarga exponencialmente. La constante de tiempo τ = RC indica el tiempo necesario para alcanzar ~63% del cambio total.',
      f: [
        ['V_C(t) = V (1 - e^{-t/RC})', 'Carga'],
        ['V_C(t) = V_0 e^{-t/RC}', 'Descarga'],
        ['τ = R C', 'Constante de tiempo'],
      ],
    },
    {
      t: 'Magnetismo',
      d: 'La fuerza de Lorentz actúa sobre una carga en movimiento dentro de un campo magnético, siempre perpendicular a la velocidad y al campo. Esto produce trayectorias circulares o helicoidales.',
      f: [
        ['F = |q| v B sen θ', 'Fuerza magnética'],
        ['r = [m v_⊥] / [|q| B]', 'Radio de giro'],
        ['T = [2π m] / [|q| B]', 'Periodo'],
      ],
    },
    {
      t: 'Inducción electromagnética',
      d: 'La Ley de Faraday establece que un flujo magnético variable induce una fuerza electromotriz. La Ley de Lenz indica que la corriente inducida se opone al cambio que la genera.',
      f: [
        ['ε = -N [dΦ_B] / [dt]', 'Ley de Faraday'],
        ['Φ_B = B A cos θ', 'Flujo magnético'],
        ['ε_{max} = N B A ω', 'FEM máxima de un generador'],
      ],
    },
    {
      t: 'Motores eléctricos',
      d: 'El torque sobre una espira con corriente dentro de un campo magnético es la base de los motores eléctricos. Un conmutador invierte la corriente cada media vuelta para mantener el giro continuo.',
      f: [
        ['τ = N I A B sen θ', 'Torque sobre la espira'],
        ['μ = N I A', 'Momento magnético'],
      ],
    },
    {
      t: 'Ondas electromagnéticas',
      d: 'Las ondas electromagnéticas son oscilaciones perpendiculares de campos eléctrico y magnético que se propagan en el vacío a la velocidad de la luz, formando el espectro electromagnético.',
      f: [
        ['c = f λ', 'Relación fundamental'],
        ['c = [1] / [sqrt[μ_0 ε_0]] ≈ 3 × 10^8 "m/s"', 'Velocidad de la luz'],
        ['E = c B', 'Relación entre campos'],
      ],
    },
  ];

  temas.forEach(tm => {
    const block = document.createElement('div');
    block.className = 'content-block';
    block.innerHTML = `<h3>${tm.t}</h3><p>${tm.d}</p>
      <div class="theory-formulas">
        ${tm.f.map(([expr, label]) => `<div class="theory-formula">${M.eq(expr)}<span class="f-label">${label}</span></div>`).join('')}
      </div>`;
    view.appendChild(block);
  });
}

// ---------- Ejercicios ----------
const EJERCICIOS = [
  { q: '¿Cuál es la fuerza entre dos cargas de +4 µC y -2 µC separadas 0.3 m en el aire?', a: 'F = k|q₁q₂|/r² = (8.99×10⁹)(4×10⁻⁶)(2×10⁻⁶)/(0.3)² ≈ 0.80 N (atractiva).' },
  { q: 'Un campo uniforme de 600 N/C atraviesa una placa de 0.5 m × 0.4 m. Si la normal forma 60° con el campo, ¿cuál es el flujo?', a: 'Φ = E·A·cos θ = 600 × 0.2 × cos 60° = 60 N·m²/C.' },
  { q: 'Una esfera gaussiana encierra cargas de +3 µC y −1 µC. ¿Cuál es el flujo eléctrico total?', a: 'Φ = q_enc/ε₀ = (2×10⁻⁶)/(8.85×10⁻¹²) ≈ 2.26×10⁵ N·m²/C. Las cargas exteriores no cambian este resultado.' },
  { q: 'Un circuito tiene una fuente de 9V y dos resistencias en serie de 100Ω y 200Ω. Calcula la corriente.', a: 'R_total = 300Ω → I = V/R = 9/300 = 0.03 A = 30 mA.' },
  { q: 'Un capacitor de 100 µF se carga con una fuente de 5V a través de 2 kΩ. ¿Cuál es la constante de tiempo τ?', a: 'τ = R·C = 2000 × 100×10⁻⁶ = 0.2 s.' },
  { q: 'Un protón se mueve a 2×10⁶ m/s perpendicular a un campo de 0.5 T. Calcula la fuerza magnética.', a: 'F = qvB = (1.6×10⁻¹⁹)(2×10⁶)(0.5) ≈ 1.6×10⁻¹³ N.' },
  { q: 'Una espira de 10 cm² gira en un campo de 0.2 T a 5 Hz. Calcula la FEM máxima con N=100 espiras.', a: 'ε_max = N·B·A·ω = 100 × 0.2 × 10×10⁻⁴ × (2π×5) ≈ 0.63 V.' },
  { q: '¿Cuál es la longitud de onda de una señal de radio de 100 MHz?', a: 'λ = c/f = 3×10⁸ / 1×10⁸ = 3 m.' },
];

function renderEjercicios() {
  const view = document.getElementById('view');
  view.innerHTML = `<div class="screen-header"><div class="screen-header-left"><div class="screen-title">Ejercicios</div></div></div>`;
  EJERCICIOS.forEach((ex, i) => {
    const box = document.createElement('div');
    box.className = 'exercise';
    box.innerHTML = `
      <div class="exercise-q">${i + 1}. ${ex.q}</div>
      <div class="exercise-toggle" data-i="${i}">Mostrar solución</div>
      <div class="exercise-answer" id="ans-${i}">${ex.a}</div>
    `;
    view.appendChild(box);
  });
  view.querySelectorAll('.exercise-toggle').forEach(t => {
    t.onclick = () => {
      const ans = view.querySelector('#ans-' + t.dataset.i);
      ans.classList.toggle('show');
      t.textContent = ans.classList.contains('show') ? 'Ocultar solución' : 'Mostrar solución';
    };
  });
}

// ---------- Mis Experimentos ----------
function renderExperimentos() {
  const view = document.getElementById('view');
  view.innerHTML = `<div class="screen-header"><div class="screen-header-left"><div class="screen-title">Mis Experimentos</div></div></div>`;

  const form = document.createElement('div');
  form.className = 'content-block';
  form.innerHTML = `
    <h3>Registrar observación</h3>
    <div class="field"><input type="text" id="exp-title" placeholder="Título del experimento" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--card-2);color:var(--text)"></div>
    <div class="field"><textarea id="exp-notes" placeholder="Notas, resultados, conclusiones..." rows="3" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--card-2);color:var(--text);font-family:inherit"></textarea></div>
    <button class="btn" id="exp-save" style="width:auto;padding:9px 20px">Guardar experimento</button>
  `;
  view.appendChild(form);

  const list = document.createElement('div');
  list.id = 'exp-list';
  view.appendChild(list);

  function load() {
    try { return JSON.parse(localStorage.getItem('f3-experimentos') || '[]'); }
    catch { return []; }
  }
  function save(data) { localStorage.setItem('f3-experimentos', JSON.stringify(data)); }

  function renderList() {
    const data = load();
    list.innerHTML = '';
    if (!data.length) {
      list.innerHTML = `<div class="empty-state"><div class="big-ico">${icon('flask', 30)}</div>Aún no has registrado experimentos.</div>`;
      return;
    }
    data.slice().reverse().forEach((e, idx) => {
      const realIndex = data.length - 1 - idx;
      const box = document.createElement('div');
      box.className = 'content-block';
      box.innerHTML = `
        <h3>${e.title}</h3>
        <p style="margin-bottom:6px">${e.notes || ''}</p>
        <div class="result-label" style="font-size:11px">${e.date}</div>
        <div class="exercise-toggle" data-del="${realIndex}" style="margin-top:8px;color:var(--red)">Eliminar</div>
      `;
      list.appendChild(box);
    });
    list.querySelectorAll('[data-del]').forEach(btn => {
      btn.onclick = () => {
        const data2 = load();
        data2.splice(parseInt(btn.dataset.del), 1);
        save(data2);
        renderList();
      };
    });
  }

  form.querySelector('#exp-save').onclick = () => {
    const title = form.querySelector('#exp-title').value.trim();
    const notes = form.querySelector('#exp-notes').value.trim();
    if (!title) return;
    const data = load();
    data.push({ title, notes, date: new Date().toLocaleString('es-CO') });
    save(data);
    form.querySelector('#exp-title').value = '';
    form.querySelector('#exp-notes').value = '';
    renderList();
  };

  renderList();
}

// ---------- Configuración ----------
function renderConfiguracion() {
  const view = document.getElementById('view');
  view.innerHTML = `<div class="screen-header"><div class="screen-header-left"><div class="screen-title">Configuración</div></div></div>`;

  const block = document.createElement('div');
  block.className = 'content-block';
  block.innerHTML = `
    <h3>Apariencia</h3>
    <p>Cambia entre modo claro y oscuro. También puedes usar el botón en la barra lateral.</p>
    <button class="btn secondary" id="cfg-theme" style="width:auto;padding:9px 20px">Alternar tema</button>
  `;
  view.appendChild(block);

  const block2 = document.createElement('div');
  block2.className = 'content-block';
  block2.innerHTML = `
    <h3>Datos guardados</h3>
    <p>Tus experimentos guardados se almacenan localmente en este navegador.</p>
    <button class="btn red" id="cfg-clear" style="width:auto;padding:9px 20px">Borrar mis experimentos</button>
  `;
  view.appendChild(block2);

  block.querySelector('#cfg-theme').onclick = () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  };
  block2.querySelector('#cfg-clear').onclick = () => {
    localStorage.removeItem('f3-experimentos');
    alert('Experimentos eliminados.');
  };
}

// ---------- Acerca de ----------
function renderAcerca() {
  const view = document.getElementById('view');
  view.innerHTML = `<div class="screen-header"><div class="screen-header-left"><div class="screen-title">Acerca de</div></div></div>`;

  const block = document.createElement('div');
  block.className = 'content-block';
  block.innerHTML = `
    <h3>Física 3 · Simulador de Electricidad y Magnetismo</h3>
    <p>Aplicación educativa interactiva para explorar los principales fenómenos de electrostática, circuitos, magnetismo, inducción electromagnética, motores eléctricos y ondas electromagnéticas, con simulaciones basadas en las fórmulas físicas reales de cada tema.</p>
    <p>Construida con HTML, CSS y JavaScript puro (sin frameworks ni dependencias externas).</p>
    <p style="margin-top:16px;font-size:14px"><strong>Desarrollado por Harold Casas Tinjaca</strong></p>
  `;
  view.appendChild(block);
}
