"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showDrop, setShowDrop]     = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focused, setFocused]       = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);
  const router      = useRouter();

  // ── Debounced search ──
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${
            encodeURIComponent(query.trim())
          }&limit=6`
        );
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowDrop(true);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // ── Close on outside click ──
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && 
          !wrapperRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => 
      document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Keyboard navigation ──
  const handleKeyDown = (e) => {
    if (!showDrop || suggestions.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        handleFullSearch();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => 
        Math.min(i + 1, suggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSelectSuggestion(suggestions[activeIndex]);
      } else {
        handleFullSearch();
      }
    } else if (e.key === 'Escape') {
      setShowDrop(false);
      setActiveIndex(-1);
    }
  };

  const handleSelectSuggestion = (product) => {
    setQuery(product.name);
    setShowDrop(false);
    router.push(`/customer/products/${product._id}`);
  };

  const handleFullSearch = () => {
    setShowDrop(false);
    router.push(
      `/customer/products?search=${
        encodeURIComponent(query.trim())
      }`
    );
  };

  // ── Highlight matching text ──
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{
            background: '#fef08a',
            color: '#111827',
            fontWeight: '600',
            borderRadius: '2px',
            padding: '0 1px',
          }}>{part}</mark>
        : part
    );
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', flex: 1, minWidth: 0 }}
    >
      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: focused ? '1.5px solid #111827' : '1.5px solid #e5e7eb',
        boxShadow: focused ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
        borderRadius: '24px',
        background: focused ? '#ffffff' : '#f9fafb',
        padding: '0 14px',
        gap: '8px',
        transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
      }}>
        {/* Search icon */}
        <svg width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="#9ca3af" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            if (suggestions.length > 0) setShowDrop(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
          placeholder="Search for brands, products..."
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: '14px',
            color: '#111827',
            padding: '11px 0',
            minWidth: 0,
          }}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowDrop(false);
            }}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', color: '#9ca3af',
              fontSize: '18px', padding: '2px',
              display: 'flex', alignItems: 'center',
              flexShrink: 0,
            }}
          >✕</button>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="spinner-animation" style={{
            width: '16px', height: '16px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #111827',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            flexShrink: 0,
          }}/>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDrop && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0, right: 0,
          background: 'white',
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          zIndex: 100,
          overflow: 'hidden',
          animation: 'dropdownIn 0.15s ease forwards',
        }}>

          {/* Header */}
          <div style={{
            padding: '10px 14px 8px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #f3f4f6',
          }}>
            Suggestions
          </div>

          {/* Suggestion items */}
          {suggestions.map((product, i) => (
            <div
              key={product._id}
              onClick={() => handleSelectSuggestion(product)}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                cursor: 'pointer',
                background: activeIndex === i
                  ? '#f9fafb' : 'white',
                borderBottom: i < suggestions.length - 1
                  ? '1px solid #f9fafb' : 'none',
                transition: 'background 0.1s ease',
              }}
            >
              {/* Product thumbnail */}
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '42px', height: '42px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1px solid #f3f4f6',
                }}
                onError={e => {
                  e.target.style.display = 'none';
                }}
              />

              {/* Product info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {highlightMatch(product.name, query)}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '2px',
                }}>
                  {product.category}
                  {product.brand && ` • ${product.brand}`}
                </div>
              </div>

              {/* Price */}
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                flexShrink: 0,
              }}>
                ₹{product.price?.toLocaleString('en-IN')}
              </div>
            </div>
          ))}

          {/* View all results footer */}
          <div
            onClick={handleFullSearch}
            style={{
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#111827',
              cursor: 'pointer',
              background: '#f9fafb',
              textAlign: 'center',
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            See all results for "{query}"
          </div>
        </div>
      )}

      {/* No results */}
      {showDrop && !loading && 
       query.length >= 2 && suggestions.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0, right: 0,
          background: 'white',
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          zIndex: 100,
          padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '14px', color: '#6b7280'
          }}>
            No products found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
