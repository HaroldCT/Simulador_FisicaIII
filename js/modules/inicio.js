const TOPIC_CARDS = [
  { cat: 'electrostatica', ico: 'bolt',     color: '#3b82f6', name: 'Electrostática', desc: 'Coulomb, campo eléctrico, flujo y ley de Gauss' },
  { cat: 'circuitos',      ico: 'circuit',  color: '#16a34a', name: 'Circuitos',      desc: 'Ohm, Kirchhoff, resistencias y circuitos RC' },
  { cat: 'magnetismo',     ico: 'magnet',   color: '#8b5cf6', name: 'Magnetismo',     desc: 'Campo magnético, fuerzas y leyes' },
  { cat: 'induccion',      ico: 'swirl',    color: '#f59e0b', name: 'Inducción',      desc: 'Ley de Faraday y corriente inducida' },
  { cat: 'motores',        ico: 'gear',     color: '#0d9488', name: 'Motores',       desc: 'Torque magnético y motor eléctrico' },
  { cat: 'ondas',          ico: 'broadcast',color: '#ec4899', name: 'Ondas EM',      desc: 'Introducción a las ondas electromagnéticas' },
];

function topicCard(c) {
  const disabled = CATEGORIES[c.cat].disabled;
  const card = document.createElement('div');
  card.className = 'topic-card' + (disabled ? ' disabled' : '');
  card.innerHTML = `
    <div class="topic-ico" style="background:${c.color}22;color:${c.color}">${icon(c.ico, 22)}</div>
    <div class="topic-name">${c.name}${disabled ? ' <span class="soon">Próximamente</span>' : ''}</div>
    <div class="topic-desc">${c.desc}</div>
  `;
  if (!disabled) card.onclick = () => { location.hash = '#/' + CATEGORIES[c.cat].routes[0]; };
  return card;
}

function renderInicio() {
  const view = document.getElementById('view');
  view.innerHTML = '';

  const hero = document.createElement('div');
  hero.className = 'hero';
  hero.innerHTML = `
    <div class="hero-eyebrow">Bienvenido al</div>
    <div class="hero-title">Simulador de Electricidad y Magnetismo</div>
    <div class="hero-desc">Explora, experimenta y comprende los fenómenos electromagnéticos de forma interactiva.</div>
    <div class="hero-orb"></div>
  `;
  view.appendChild(hero);

  const grid = document.createElement('div');
  grid.className = 'card-grid';
  TOPIC_CARDS.forEach(c => {
    const card = topicCard(c);
    grid.appendChild(card);
  });
  view.appendChild(grid);
}

function renderLaboratorio() {
  document.getElementById('view').innerHTML = '';
  const view = document.getElementById('view');
  const header = document.createElement('div');
  header.className = 'screen-header';
  header.innerHTML = `<div class="screen-header-left"><div class="screen-title">Laboratorio</div></div>`;
  view.appendChild(header);

  const p = document.createElement('p');
  p.style.color = 'var(--text-dim)';
  p.style.marginTop = '-6px';
  p.style.marginBottom = '18px';
  p.textContent = 'Elige un experimento para empezar a simular.';
  view.appendChild(p);

  const grid = document.createElement('div');
  grid.className = 'card-grid';
  TOPIC_CARDS.forEach(c => {
    const card = topicCard(c);
    grid.appendChild(card);
  });
  view.appendChild(grid);
}
