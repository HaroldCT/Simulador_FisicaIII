// ---------- Teoría ----------
function renderTeoria() {
  const view = document.getElementById('view');
  view.innerHTML = `<div class="screen-header"><div class="screen-header-left"><div class="screen-title">Teoría</div></div></div>`;

  // f: [expresión en sintaxis M.eq, etiqueta]
  const temas = [
    {
      t: 'Ley de Coulomb',
      d: 'La Ley de Coulomb describe la fuerza entre dos cargas puntuales: es proporcional al producto de las cargas e inversamente proporcional al cuadrado de la distancia que las separa. Cargas del mismo signo se repelen y de signo opuesto se atraen. En un medio material la fuerza se reduce según su permitividad relativa εᵣ, y por la tercera ley de Newton ambas cargas sienten fuerzas de igual magnitud y sentido opuesto.',
      f: [
        ['F = [k |q_1 q_2|] / [r^2]', 'Ley de Coulomb'],
        ['k = [1] / [4π ε_0] ≈ 8.99 × 10^9 "N·m²/C²"', 'Constante de Coulomb'],
        ['F = [k |q_1 q_2|] / [ε_r r^2]', 'En un medio dieléctrico'],
        ['U = [k q_1 q_2] / [r]', 'Energía potencial del par'],
      ],
    },
    {
      t: 'Campo eléctrico',
      d: 'El campo eléctrico es la fuerza por unidad de carga que sentiría una carga de prueba positiva en un punto. Para varias cargas se aplica el principio de superposición: el campo total es la suma vectorial de los campos de cada carga. Las líneas de campo salen de las cargas positivas y llegan a las negativas, y las superficies equipotenciales son siempre perpendiculares a ellas.',
      f: [
        ['E = [F] / [q_0]', 'Definición'],
        ['E = [k q] / [r^2]', 'Carga puntual'],
        ['E = Σ [k q_i] / [r_i^2] r̂_i', 'Superposición'],
        ['V = Σ [k q_i] / [r_i]', 'Potencial eléctrico'],
        ['F = q_0 E', 'Fuerza sobre una carga de prueba'],
      ],
    },
    {
      t: 'Flujo eléctrico y Ley de Gauss',
      d: 'El flujo eléctrico mide cuántas líneas de campo atraviesan una superficie. Para una superficie plana en un campo uniforme depende del ángulo entre E y el vector normal. La Ley de Gauss establece que el flujo total a través de cualquier superficie cerrada es proporcional a la carga neta encerrada; las cargas exteriores no aportan flujo neto. Con ella se obtiene fácilmente el campo de cascarones esféricos y de placas cargadas.',
      f: [
        ['Φ_E = E A cos θ', 'Superficie plana, campo uniforme'],
        ['Φ_E = ∫ E · dA', 'Definición general'],
        ['∮ E · dA = [q_{enc}] / [ε_0]', 'Ley de Gauss'],
        ['ε_0 = 8.85 × 10^{-12} "C²/N·m²"', 'Permitividad del vacío'],
        ['E = [q] / [4π ε_0 r^2]', 'Gauss con simetría esférica'],
        ['E = [σ] / [2 ε_0]', 'Plano infinito cargado'],
        ['E = [σ] / [ε_0]', 'Entre placas con signos opuestos'],
        ['E_{"dentro"} = 0', 'Interior de un conductor'],
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
  { q: 'Un cascarón esférico delgado de radio 0.5 m tiene carga Q = +4 µC y en su centro hay q = +2 µC. Calcula E a r = 0.2 m y a r = 1 m.', a: 'r = 0.2 m (dentro): solo cuenta q → E = kq/r² = (8.99×10⁹)(2×10⁻⁶)/0.04 ≈ 4.5×10⁵ N/C. r = 1 m (fuera): q_enc = 6 µC → E = (8.99×10⁹)(6×10⁻⁶)/1² ≈ 5.4×10⁴ N/C.' },
  { q: 'Dos placas paralelas infinitas tienen σ = ±3 µC/m² y están separadas 2 mm. ¿Cuánto vale E entre ellas y fuera? ¿Y si ambas son +3 µC/m²?', a: 'Signos opuestos: E = σ/ε₀ = 3×10⁻⁶ / 8.85×10⁻¹² ≈ 3.4×10⁵ N/C entre ellas y 0 afuera (ΔV = E·d ≈ 678 V). Mismo signo: E = 0 entre ellas y 3.4×10⁵ N/C afuera, alejándose de las placas.' },
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
