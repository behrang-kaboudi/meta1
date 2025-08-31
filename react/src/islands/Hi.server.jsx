// react/islands/Hi.server.jsx
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Hi from './Hi.jsx';

export function render(props) {
  return ReactDOMServer.renderToString(<Hi {...props} />);
}
