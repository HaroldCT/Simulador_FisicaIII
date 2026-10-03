// Icono SVG minimalista tipo outline, sin dependencias externas.
const ICON_PATHS = {
  atom: '<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="3.8"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(120 12 12)"/>',
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M9.5 19.5V14h5v5.5"/>',
  flask: '<path d="M10 3h4"/><path d="M10.5 3v6.2L5 18a1.8 1.8 0 0 0 1.6 2.6h10.8A1.8 1.8 0 0 0 19 18l-5.5-8.8V3"/><path d="M7.5 15.5h9"/>',
  book: '<path d="M5.5 20A2.2 2.2 0 0 1 7.7 17.8H19V3H7.7A2.2 2.2 0 0 0 5.5 5.2Z"/><path d="M5.5 17.8V5.2"/>',
  edit: '<path d="M12.5 19h7"/><path d="M15.7 4.3a1.9 1.9 0 0 1 2.7 2.7L7.5 17.9l-3.8.9.9-3.8Z"/>',
  activity: '<path d="M21 12h-3.5l-2.5 7-4-14-2.5 7H3"/>',
  sliders: '<path d="M4 20v-6M4 10V4"/><path d="M12 20v-8M12 8V4"/><path d="M20 20v-4M20 12V4"/><path d="M1.5 14h5"/><path d="M9.5 8h5"/><path d="M17.5 12h5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5"/><circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
  moon: '<path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.7 6.7 0 0 0 10.2 10.2Z"/>',
  bolt: '<path d="M12.5 2 4 13.5h6.5L11 22l8.5-11.5H13z"/>',
  circuit: '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h4"/><path d="M13 12h4"/><rect x="10.2" y="9.2" width="3.6" height="5.6" rx="0.8"/>',
  magnet: '<path d="M6 4.5h4V13a2 2 0 0 1-4 0Z"/><path d="M14 4.5h4V13a2 2 0 0 1-4 0Z"/><path d="M6 9.5h4M14 9.5h4"/>',
  swirl: '<path d="M20.5 4.5v5h-5"/><path d="M3.5 19.5v-5h5"/><path d="M4.8 9.3a7.5 7.5 0 0 1 12.6-3.1l3.1 3.1"/><path d="M19.2 14.7a7.5 7.5 0 0 1-12.6 3.1L3.5 14.7"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5M17.7 17.7l-1.5-1.5M7.8 7.8 6.3 6.3"/>',
  broadcast: '<path d="M3 13c2.5-5 6.5-8 9-8s6.5 3 9 8"/><path d="M6.3 15c1.6-3 4-4.8 5.7-4.8s4.1 1.8 5.7 4.8"/><circle cx="12" cy="18.5" r="1.4" fill="currentColor" stroke="none"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
};

function icon(name, size = 18) {
  const inner = ICON_PATHS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
