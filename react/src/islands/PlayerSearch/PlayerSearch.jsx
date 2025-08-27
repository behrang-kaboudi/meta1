import React, { useEffect, useRef, useState } from 'react';
import PlayerRow from './PlayerRow';

export default function PlayerSearch({ placeholder = 'Users', className = '' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // هایلایت انتخاب

  // مرجع‌ها
  const parentRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const seqRef = useRef(0);

  // کلیک بیرون
  useEffect(() => {
    const handleOutside = (e) => {
      if (!parentRef.current) return;
      if (!parentRef.current.contains(e.target)) setIsOpen(false);
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, []);

  // بستن با Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // دی‌بونس جستجو روی mock data
  useEffect(() => {
    const q = query.trim().toLowerCase();

    if (q.length < 2) {
      setSearching(false);
      setResults([]);
      return;
    }

    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const mySeq = ++seqRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        // الگوی EJS قبلی‌ت: socket.emit('search', oppUserName, ack)

        socket.emit('search', q, (ans) => {
          if (mySeq !== seqRef.current) return; // ردِ پاسخ قدیمی (anti-race)
          //   console.log(ans);
          //   console.log(ans[0].id);
          setResults(ans);
          setSearching(false);
          setIsOpen(true);
        });
      } catch (err) {
        if (mySeq !== seqRef.current) return;
        console.error(`${'search'} emit failed:`, err);
        setResults([]);
        setSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div
      ref={parentRef}
      className={`position-relative d-flex align-items-center ${className}`}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      <i className="fas fa-search mx-2 fs-4" aria-hidden="true" />

      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="form-control me-2 dir-ltr"
        autoComplete="off"
        type="search"
        placeholder={placeholder}
        aria-label="Search players"
      />

      {isOpen && (
        <div
          id="player-search-popup"
          className="position-absolute bg-light mt-2 shadow-sm border rounded"
          style={{ zIndex: 100, top: '38px', width: '100%' }}
          role="listbox"
        >
          {searching ? (
            <div className="p-3 text-muted small">Searching…</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-muted small">No players found</div>
          ) : (
            <div className="list-group list-group-flush">
              {results.map((p) => (
                <PlayerRow key={p.id} user={p} isActive={selectedId === p.id} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ریسپانسیو */}
      <style>{`
        @media (max-width: 576px) {
          #player-search-popup { left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
