"use client"
import { useState, useEffect, useRef } from 'react';
import { search, SearchResult } from '@/lib/search';

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open modal via custom event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-search', handler);
    return () => window.removeEventListener('open-search', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  // Perform search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      const hits = await search(query);
      setResults(hits);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="bg-surface2 rounded-lg w-full max-w-2xl mx-4 p-6" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="w-full p-2 text-lg border border-muted2 rounded focus:outline-none focus:border-accent bg-bg text-text"
          placeholder="Search documentation…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="mt-4 max-h-80 overflow-y-auto">
          {results.length === 0 && query && (
            <p className="text-muted">No results found.</p>
          )}
          {results.map((r, i) => (
            <a
              key={i}
              href={r.url}
              className="block py-2 hover:text-accent"
              onClick={() => setOpen(false)}
            >
              <h3 className="font-medium text-text">{r.title}</h3>
              <p className="text-sm text-muted2 line-clamp-2" dangerouslySetInnerHTML={{ __html: r.excerpt }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
