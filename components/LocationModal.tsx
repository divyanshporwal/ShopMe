import { useState } from 'react';
import showToast from '@/lib/toast';

const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Indore', 'Jaipur', 'Lucknow', 'Surat',
  'Bhopal', 'Nagpur', 'Visakhapatnam', 'Patna',
  'Vadodara', 'Ludhiana', 'Agra', 'Nashik',
  'Coimbatore', 'Chandigarh', 'Guwahati', 'Kochi',
];

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  currentLocation: string;
}

export default function LocationModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentLocation 
}: LocationModalProps) {
  const [search, setSearch] = useState('');
  const [detecting, setDetecting] = useState(false);

  const filtered = POPULAR_CITIES.filter(city =>
    city.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city: string) => {
    onSelect(city);
    localStorage.setItem('shopme_location', city);
    onClose();
  };

  const handleDetectLocation = () => {
    setDetecting(true);
    if (!navigator.geolocation) {
      showToast.error('Geolocation not supported by your browser');
      setDetecting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode using free API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address.city
                    || data.address.town
                    || data.address.village
                    || data.address.county
                    || 'Unknown Location';
          handleSelect(city);
          showToast.success(`Location set to ${city}`);
        } catch {
          showToast.error('Could not detect location');
        } finally {
          setDetecting(false);
        }
      },
      () => {
        showToast.error('Location access denied');
        setDetecting(false);
      }
    );
  };

  if (!isOpen) return null;

  return (
    // Full screen overlay
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Modal card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '700',
                         color: '#111827', margin: 0 }}>
              Choose Delivery Location
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280',
                        margin: '2px 0 0' }}>
              Select where you want your orders delivered
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            fontSize: '20px', cursor: 'pointer',
            color: '#6b7280', padding: '4px',
          }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 20px 12px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '12px',
              top: '50%', transform: 'translateY(-50%)',
              color: '#9ca3af', fontSize: '16px',
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search your city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                border: '1.5px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Detect location button */}
        <div style={{ padding: '0 20px 12px' }}>
          <button
            onClick={handleDetectLocation}
            disabled={detecting}
            style={{
              width: '100%',
              padding: '10px',
              border: '1.5px dashed #d1d5db',
              borderRadius: '10px',
              background: '#f9fafb',
              cursor: detecting ? 'wait' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            📌 {detecting ? 'Detecting...' : 'Use my current location'}
          </button>
        </div>

        {/* Cities grid — scrollable */}
        <div style={{
          padding: '0 20px 20px',
          overflowY: 'auto',
          flex: 1,
        }}>
          <p style={{
            fontSize: '11px', fontWeight: '600',
            color: '#9ca3af', textTransform: 'uppercase',
            letterSpacing: '0.05em', marginBottom: '10px',
          }}>
            {search ? 'Search Results' : 'Popular Cities'}
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {filtered.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                No cities found for "{search}"
              </p>
            ) : (
              filtered.map(city => (
                <button
                  key={city}
                  onClick={() => handleSelect(city)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '20px',
                    border: city === currentLocation
                      ? '1.5px solid #111827'
                      : '1.5px solid #e5e7eb',
                    background: city === currentLocation
                      ? '#111827' : '#ffffff',
                    color: city === currentLocation
                      ? '#ffffff' : '#374151',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
