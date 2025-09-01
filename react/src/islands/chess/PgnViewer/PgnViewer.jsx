// react/src/islands/chess/PgnViewer/PgnViewer.jsx
import React, { useMemo, useEffect } from 'react';
import { enrichPgn } from '@shared/chess/enrichPgn.js';

export default function PgnViewer({ pgnText = '', onReady, debug = false }) {
  const enriched = useMemo(() => {
    let game = null;
    game = enrichPgn(pgnText);
  }, [pgnText]);

  // حالت مشاهدهٔ سریع برای دیباگ
  if (!debug) return null;
  return (
    <pre
      style={{
        fontSize: 12,
        padding: 12,
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'auto',
        maxHeight: 320,
      }}
    >
      {JSON.stringify(enriched, null, 2)}
    </pre>
  );
}
