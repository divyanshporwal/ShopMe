import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "ShopMe",
  description: "ShopMe ecommerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={10}
          containerStyle={{
            top: 24,
            right: 24,
          }}
          toastOptions={{
            duration: 3000,

            // ── BASE STYLE (all toasts) ──
            style: {
              minWidth: '280px',
              maxWidth: '340px',
              width: 'fit-content',
              padding: '14px 18px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '500',
              lineHeight: '1.4',
              color: '#111827',
              background: '#ffffff',
              boxShadow: `
                0 4px 6px -1px rgba(0,0,0,0.07),
                0 10px 30px -5px rgba(0,0,0,0.12)
              `,
              border: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            },

            // ── SUCCESS TOAST ──
            success: {
              duration: 3000,
              style: {
                minWidth: '280px',
                maxWidth: '340px',
                width: 'fit-content',
                padding: '14px 18px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: '500',
                lineHeight: '1.4',
                background: '#f0fdf4',
                color: '#14532d',
                border: '1px solid #bbf7d0',
                boxShadow: `
                  0 4px 6px -1px rgba(0,0,0,0.06),
                  0 10px 30px -5px rgba(34,197,94,0.15)
                `,
              },
              iconTheme: {
                primary: '#16a34a',
                secondary: '#f0fdf4',
              },
            },

            // ── ERROR TOAST ──
            error: {
              duration: 4000,
              style: {
                minWidth: '280px',
                maxWidth: '340px',
                width: 'fit-content',
                padding: '14px 18px',
                borderRadius: '14px',
                fontSize: '13.5px',
                fontWeight: '500',
                lineHeight: '1.4',
                background: '#fef2f2',
                color: '#7f1d1d',
                border: '1px solid #fecaca',
                boxShadow: `
                  0 4px 6px -1px rgba(0,0,0,0.06),
                  0 10px 30px -5px rgba(239,68,68,0.15)
                `,
              },
              iconTheme: {
                primary: '#dc2626',
                secondary: '#fef2f2',
              },
            },

            // ── LOADING TOAST ──
            loading: {
              style: {
                minWidth: '280px',
                maxWidth: '340px',
                width: 'fit-content',
                padding: '14px 18px',
                borderRadius: '14px',
                fontSize: '13.5px',
                fontWeight: '500',
                lineHeight: '1.4',
                background: '#fafafa',
                color: '#374151',
                border: '1px solid #e5e7eb',
                boxShadow: `
                  0 4px 6px -1px rgba(0,0,0,0.06),
                  0 10px 30px -5px rgba(0,0,0,0.10)
                `,
              },
              iconTheme: {
                primary: '#111827',
                secondary: '#f9fafb',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
