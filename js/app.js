// Enrutador principal y control de tema/sidebar.
// disabled: true oculta temporalmente el módulo (el código se conserva).
const CATEGORIES = {
  coulomb:        { label: 'Ley de Coulomb',   routes: ['coulomb'] },
  campo:          { label: 'Campo Eléctrico',  routes: ['campo-electrico'] },
  flujo:          { label: 'Flujo Eléctrico',  routes: ['flujo-electrico'] },
  circuitos:      { label: 'Circuitos',       routes: ['ohm', 'circuito-rc'], disabled: true },
  magnetismo:     { label: 'Magnetismo',      routes: ['magnetismo'], disabled: true },
  induccion:      { label: 'Inducción',       routes: ['induccion'], disabled: true },
  motores:        { label: 'Motores',         routes: ['motores'], disabled: true },
  ondas:          { label: 'Ondas EM',        routes: ['ondas'], disabled: true },
};

const ROUTE_META = {
  'coulomb':         { title: 'Ley de Coulomb',      render: renderCoulomb,        category: 'coulomb' },
  'campo-electrico': { title: 'Campo Eléctrico',      render: renderCampoElectrico, category: 'campo' },
  'flujo-electrico': { title: 'Flujo Eléctrico',      render: renderFlujoElectrico, category: 'flujo' },
  'ohm':             { title: 'Ohm y Kirchhoff',      render: renderOhm,            category: 'circuitos' },
  'circuito-rc':     { title: 'Circuito RC',          render: renderCircuitoRC,     category: 'circuitos' },
  'magnetismo':      { title: 'Campo Magnético',      render: renderMagnetismo,     category: 'magnetismo' },
  'induccion':       { title: 'Ley de Faraday',       render: renderInduccion,      category: 'induccion' },
  'motores':         { title: 'Motor Eléctrico',      render: renderMotores,        category: 'motores' },
  'ondas':           { title: 'Ondas Electromagnéticas', render: renderOndas,       category: 'ondas' },
};

// El módulo activo registra aquí su función de redibujado para reaccionar al cambio de tema
// sin volver a renderizar la pantalla (así no se pierden los datos ingresados).
let currentRedraw = null;
function setRedraw(fn) { currentRedraw = fn; }

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeIcon').innerHTML = icon(t === 'dark' ? 'sun' : 'moon', 16);
  document.getElementById('themeLabel').textContent = t === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
  localStorage.setItem('f3-theme', t);
  window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
}

function initIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = icon(el.dataset.icon, el.classList.contains('brand-icon') ? 18 : 17);
  });
}

function initTheme() {
  const saved = localStorage.getItem('f3-theme') || 'dark';
  applyTheme(saved);
  document.getElementById('themeToggle').addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
}

function screenShell({ title, showBack = true, category = null, active = null }) {
  const view = document.getElementById('view');
  view.innerHTML = '';
  currentRedraw = null;

  const header = document.createElement('div');
  header.className = 'screen-header';

  const left = document.createElement('div');
  left.className = 'screen-header-left';
  if (showBack) {
    const back = document.createElement('button');
    back.className = 'back-btn';
    back.textContent = '←';
    back.onclick = () => location.hash = '#/inicio';
    left.appendChild(back);
  }
  const h = document.createElement('div');
  h.className = 'screen-title';
  h.textContent = title;
  left.appendChild(h);
  header.appendChild(left);

  const right = document.createElement('div');
  right.style.display = 'flex';
  right.style.gap = '8px';
  const info = document.createElement('button');
  info.className = 'icon-btn';
  info.innerHTML = icon('info', 15);
  info.title = 'Información';
  info.onclick = () => {
    const box = view.querySelector('.info-note');
    if (box) box.classList.toggle('show');
  };
  right.appendChild(info);
  header.appendChild(right);

  view.appendChild(header);

  if (category && CATEGORIES[category].routes.length > 1) {
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    CATEGORIES[category].routes.forEach(r => {
      const tab = document.createElement('div');
      tab.className = 'tab' + (r === active ? ' active' : '');
      tab.textContent = ROUTE_META[r].title;
      tab.onclick = () => location.hash = '#/' + r;
      tabs.appendChild(tab);
    });
    view.appendChild(tabs);
  }

  const body = document.createElement('div');
  body.id = 'screen-body';
  view.appendChild(body);
  return body;
}

function setActiveNav(route) {
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

function router() {
  const hash = location.hash.replace('#/', '') || 'inicio';
  const [route] = hash.split('?');

  const topNav = ['inicio', 'experimentos', 'teoria', 'ejercicios', 'laboratorio', 'configuracion', 'acerca'];
  setActiveNav(topNav.includes(route) ? route : null);
  currentRedraw = null;

  if (route === 'inicio') return renderInicio();
  if (route === 'experimentos') return renderExperimentos();
  if (route === 'teoria') return renderTeoria();
  if (route === 'ejercicios') return renderEjercicios();
  if (route === 'laboratorio') return renderLaboratorio();
  if (route === 'configuracion') return renderConfiguracion();
  if (route === 'acerca') return renderAcerca();

  const meta = ROUTE_META[route];
  if (meta && !CATEGORIES[meta.category].disabled) {
    const body = screenShell({ title: meta.title, category: meta.category, active: route });
    meta.render(body);
    return;
  }
  location.hash = '#/inicio';
}

window.addEventListener('hashchange', router);
window.addEventListener('themechange', () => { if (currentRedraw) currentRedraw(); });
window.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initTheme();
  router();
});
