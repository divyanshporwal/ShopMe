"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag, Heart, MapPin, User, Package,
  ChevronRight, Store, ArrowRight,
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import showToast from '@/lib/toast';
import MerchantRequestModal from '@/components/MerchantRequestModal';

export default function CustomerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [orders, setOrders]                   = useState([]);
  const [ordersLoading, setOrdersLoading]     = useState(true);
  const [showMerchantModal, setShowMerchantModal] = useState(false);

  // Show notice toasts from URL params (e.g., redirect from /merchant)
  useEffect(() => {
    const notice = searchParams.get('notice');
    if (notice === 'pending') {
      showToast.error('Your merchant request is still under review');
    } else if (notice === 'no-access') {
      showToast.error('Apply for merchant access to sell on ShopMe');
    }
  }, []);

  useEffect(() => {
    fetch('/api/orders/my')
      .then(r => r.json())
      .then(data => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  const handleSwitchToMerchant = async () => {
    try {
      await fetch('/api/customer/switch-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ view: 'MERCHANT' }),
      });
      router.push('/merchant/dashboard');
    } catch {
      showToast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div style={{
          width: '32px', height: '32px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #111827',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      </div>
    );
  }

  const isMerchant = user?.role === 'MERCHANT' || user?.roles?.includes('MERCHANT');
  const merchantRequest = user?.merchantRequest || {};
  const requestStatus = merchantRequest.status || 'none';

  const quickLinks = [
    { label: 'My Orders',  href: '/customer/orders',   icon: ShoppingBag, count: orders.length },
    { label: 'Wishlist',   href: '/customer/wishlist',  icon: Heart,       count: null },
    { label: 'Browse',     href: '/customer/products',  icon: Package,     count: null },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* Switch to Merchant — shown only if user is already a merchant */}
      {isMerchant && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            onClick={handleSwitchToMerchant}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: '#111827', color: '#ffffff',
              border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1f2937';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#111827';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }}
          >
            <Store size={16} />
            Switch to Merchant Dashboard
          </button>
        </div>
      )}

      {/* Welcome header */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '28px 32px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{
          width: '56px', height: '56px',
          background: '#111827',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0' }}>
            {user?.email}
            {isMerchant && (
              <span style={{
                marginLeft: '10px',
                background: '#dcfce7', color: '#16a34a',
                fontSize: '11px', fontWeight: '700',
                padding: '2px 8px', borderRadius: '20px',
                border: '1px solid #bbf7d0',
              }}>
                MERCHANT
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {quickLinks.map(link => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '8px',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#111827';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: '36px', height: '36px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color="#374151" />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    {link.label}
                  </p>
                  {link.count !== null && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>
                      {ordersLoading ? '—' : `${link.count} total`}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent orders preview */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>
            Recent Orders
          </h2>
          <Link href="/customer/orders" style={{
            fontSize: '13px', fontWeight: '600', color: '#6b7280',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {ordersLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2].map(i => (
              <div key={i} style={{
                height: '56px', background: '#f3f4f6',
                borderRadius: '10px', animation: 'pulse 1.5s ease infinite',
              }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <ShoppingBag size={32} color="#d1d5db" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>No orders yet</p>
            <Link href="/customer/products" style={{
              display: 'inline-block', marginTop: '12px',
              fontSize: '13px', fontWeight: '700', color: '#111827',
              textDecoration: 'underline',
            }}>
              Start shopping →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orders.slice(0, 3).map(order => (
              <div key={order._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#f9fafb',
                borderRadius: '10px',
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Order #{order._id?.slice(-6).toUpperCase()}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </p>
                  <span style={{
                    fontSize: '11px', fontWeight: '600',
                    padding: '2px 8px', borderRadius: '20px',
                    background: order.status === 'delivered' ? '#dcfce7' : '#fef3c7',
                    color: order.status === 'delivered' ? '#16a34a' : '#d97706',
                  }}>
                    {order.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BECOME A MERCHANT BANNER (not shown if already merchant) ── */}
      {!isMerchant && (
        <div style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px' }}>
              Start Selling on ShopMe
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)', lineHeight: '1.6', margin: 0 }}>
              Reach thousands of customers. List your products,
              manage orders, and grow your business.
            </p>

            {requestStatus === 'pending' && (
              <div style={{
                marginTop: '14px',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(251,191,36,0.2)',
                border: '1px solid rgba(251,191,36,0.4)',
                borderRadius: '20px', padding: '5px 14px',
                fontSize: '13px', color: '#fbbf24', fontWeight: '500',
              }}>
                ⏳ Under review — we'll notify you soon
              </div>
            )}

            {requestStatus === 'rejected' && (
              <div style={{
                marginTop: '14px',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(239,68,68,0.2)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '20px', padding: '5px 14px',
                fontSize: '13px', color: '#f87171', fontWeight: '500',
              }}>
                ❌ Request rejected
                {merchantRequest.rejectionReason && ` — ${merchantRequest.rejectionReason}`}
              </div>
            )}
          </div>

          <div style={{ flexShrink: 0 }}>
            {(requestStatus === 'none' || requestStatus === 'rejected') ? (
              <button
                onClick={() => setShowMerchantModal(true)}
                style={{
                  padding: '12px 26px',
                  background: '#ffffff', color: '#111827',
                  border: 'none', borderRadius: '12px',
                  fontSize: '14px', fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                }}
              >
                <Store size={15} />
                {requestStatus === 'rejected' ? 'Reapply as Merchant' : 'Become a Merchant'}
                <ArrowRight size={14} />
              </button>
            ) : requestStatus === 'pending' ? (
              <div style={{
                padding: '12px 26px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px', fontSize: '14px',
                color: 'rgba(255,255,255,0.55)',
              }}>
                Under Review
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Merchant Request Modal */}
      {showMerchantModal && (
        <MerchantRequestModal
          onClose={() => setShowMerchantModal(false)}
          userEmail={user?.email || ''}
        />
      )}
    </div>
  );
}
