// react/islands/Hi.client.jsx
import { hydrateRoot } from 'react-dom/client';
import Hi from './Hi.jsx';

const el = document.getElementById('island-hi');
const script = document.getElementById('island-hi-props');
const props = script ? JSON.parse(script.textContent) : {};

hydrateRoot(el, <Hi {...props} />);
