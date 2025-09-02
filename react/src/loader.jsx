// import React from 'react';
// import { createRoot, hydrateRoot } from 'react-dom/client';
// const registry = {
//   Hi: () => import('./islands/Hi.jsx'),
//   PlayerSearch: () => import('./islands/PlayerSearch/PlayerSearch.jsx'),
//   HomeBtn: () => import('./islands/Btns/HomeBtn.jsx'),
// };
// function mount(el) {
//   const name = el.dataset.island;
//   const props = JSON.parse(el.dataset.props || '{}');
//   const load = registry[name];
//   if (!load) return;
//   load().then(({ default: Comp }) => {
//     if (el.firstElementChild) hydrateRoot(el, <Comp {...props} />);
//     else createRoot(el).render(<Comp {...props} />);
//   });
// }
// function boot() {
//   document.querySelectorAll('[data-island]').forEach(mount);
// }
// document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

/** 1) همه‌ی CSSها: در prod، Vite URL نهایی هَش‌دار را برمی‌گرداند */
const cssMap = import.meta.glob('./**/*.css', { as: 'url' });

async function ensureCss(relPath) {
  if (!import.meta.env.PROD) return; // dev را خود Vite هندل می‌کند
  const getHref = cssMap[relPath];
  if (!getHref) {
    console.warn('[islands] CSS not found:', relPath);
    return;
  }
  const href = await getHref(); // مثلا: /assets/assets/HomeBtn-XXXX.css
  if (!document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

/** 2) رجیستری: برای جزیره‌هایی که CSS دارند، مسیر CSS نسبی را بده */
const registry = {
  Hi: { load: () => import('./islands/Hi.jsx') },
  PlayerSearch: {
    load: () => import('./islands/PlayerSearch/PlayerSearch.jsx'),
  },
  HomeBtn: { load: () => import('./islands/Btns/HomeBtn.jsx'), css: './islands/Btns/HomeBtn.css' },
  RChessboard: { load: () => import('./islands/Chessboards/Chessboard.jsx') },
  PgnViewer: { load: () => import('./islands/chess/PgnViewer/PgnViewer.jsx') },
};

function mount(el) {
  const name = el.dataset.island;
  const entry = registry[name];
  if (!entry) return;

  let props = {};
  try {
    props = JSON.parse(el.dataset.props || '{}');
  } catch {}

  // اجازه‌ی override از HTML (اختیاری): data-css='./islands/Btns/HomeBtn.css'
  const cssRel = el.dataset.css || entry.css;

  (async () => {
    if (cssRel) await ensureCss(cssRel);
    const { default: Comp } = await entry.load();
    const tree = <Comp {...props} />;
    el.firstElementChild ? hydrateRoot(el, tree) : createRoot(el).render(tree);
  })();
}

function boot() {
  document.querySelectorAll('[data-island]').forEach(mount);
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
