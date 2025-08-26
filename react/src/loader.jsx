import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
const registry = {
  Hi: () => import('./islands/Hi.jsx'),
};
function mount(el) {
  const name = el.dataset.island;
  const props = JSON.parse(el.dataset.props || '{}');
  const load = registry[name];
  if (!load) return;
  load().then(({ default: Comp }) => {
    if (el.firstElementChild) hydrateRoot(el, <Comp {...props} />);
    else createRoot(el).render(<Comp {...props} />);
  });
}
function boot() {
  document.querySelectorAll('[data-island]').forEach(mount);
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
