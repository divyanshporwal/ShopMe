"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Store } from 'lucide-react';
import showToast from '@/lib/toast';

const BUSINESS_TYPES = [
  'Retail',
  'Wholesale',
  'Manufacturing',
  'Handmade/Craft',
  'Electronics',
  'Fashion/Apparel',
  'Food & Beverages',
  'Books & Stationery',
  'Sports & Fitness',
  'Home & Decor',
  'Other',
];

export default function MerchantRequestModal({ onClose, userEmail = '' }) {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName:    '',
    businessType:    '',
    businessEmail:   userEmail,
    businessPhone:   '',
    businessAddress: '',
    description:     '',
  });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.businessName.trim())
      e.businessName = 'Business name is required';
    if (!form.businessType)
      e.businessType = 'Select a business type';
    if (!/\S+@\S+\.\S+/.test(form.businessEmail))
      e.businessEmail = 'Enter a valid business email';
    if (!/^\d{10}$/.test(form.businessPhone.replace(/\s/g, '')))
      e.businessPhone = 'Enter a valid 10-digit phone number';
    if (!form.businessAddress.trim())
      e.businessAddress = 'Business address is required';
    if (!form.description.trim() || form.description.trim().length < 20)
      e.description = 'Tell us about your business (min 20 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/customer/merchant-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      showToast.success("Merchant request submitted! We'll review it shortly.");
      onClose();
      router.refresh();
    } catch (err) {
      showToast.error(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '10px 12px',
    border: `1.5px solid ${errors[field] ? '#fca5a5' : '#e5e7eb'}`,
    borderRadius: '10px',
    fontSize: '14px',
    color: '#111827',
    background: errors[field] ? '#fff5f5' : '#f9fafb',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.55)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        margin: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: '#111827',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Store size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>
                Merchant Application
              </h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>
                Apply to sell on ShopMe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: '4px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: '6px', flexShrink: 0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Business Name */}
          <div>
            <label style={labelStyle}>Business Name *</label>
            <input
              type="text"
              placeholder="e.g. Urban Styles Co."
              value={form.businessName}
              onChange={e => set('businessName', e.target.value)}
              style={inputStyle('businessName')}
            />
            {errors.businessName && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.businessName}</p>
            )}
          </div>

          {/* Business Type */}
          <div>
            <label style={labelStyle}>Business Type *</label>
            <select
              value={form.businessType}
              onChange={e => set('businessType', e.target.value)}
              style={{ ...inputStyle('businessType'), cursor: 'pointer' }}
            >
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.businessType && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.businessType}</p>
            )}
          </div>

          {/* Business Email + Phone (two columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Business Email *</label>
              <input
                type="email"
                placeholder="business@email.com"
                value={form.businessEmail}
                onChange={e => set('businessEmail', e.target.value)}
                style={inputStyle('businessEmail')}
              />
              {errors.businessEmail && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.businessEmail}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Business Phone *</label>
              <input
                type="tel"
                placeholder="10-digit number"
                value={form.businessPhone}
                onChange={e => set('businessPhone', e.target.value)}
                style={inputStyle('businessPhone')}
              />
              {errors.businessPhone && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.businessPhone}</p>
              )}
            </div>
          </div>

          {/* Business Address */}
          <div>
            <label style={labelStyle}>Business Address *</label>
            <input
              type="text"
              placeholder="123 MG Road, Indore, MP"
              value={form.businessAddress}
              onChange={e => set('businessAddress', e.target.value)}
              style={inputStyle('businessAddress')}
            />
            {errors.businessAddress && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.businessAddress}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Tell Us About Your Business *</label>
            <textarea
              placeholder="Describe your business, products you plan to sell, and why you want to join ShopMe..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              style={{
                ...inputStyle('description'),
                resize: 'vertical',
                minHeight: '96px',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              {errors.description
                ? <p style={{ fontSize: '12px', color: '#ef4444' }}>{errors.description}</p>
                : <span />
              }
              <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                {form.description.length}/20 min chars
              </p>
            </div>
          </div>

          {/* Info note */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>ℹ️</span>
            <p style={{ fontSize: '13px', color: '#0369a1', margin: 0, lineHeight: '1.5' }}>
              Your request will be reviewed by our team within 24–48 hours.
              You'll see the status update on your dashboard.
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '13px',
              background: submitting ? '#6b7280' : '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: '16px', height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Submitting...
              </>
            ) : (
              'Submit Application →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
