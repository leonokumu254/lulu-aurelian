import React from 'react';
import { Home, RefreshCw, AlertTriangle, MessageSquare } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[REACT ERROR BOUNDARY CAUGHT ERROR]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F3F3E6',
          padding: '24px',
          fontFamily: "'Montserrat', sans-serif",
          color: '#1D1912'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '16px',
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.12)',
              color: '#8F6517',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <AlertTriangle size={32} />
            </div>

            <span style={{
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#8F6517'
            }}>
              Lulu Aurelian Estate
            </span>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2rem',
              fontWeight: 700,
              margin: '8px 0 12px',
              color: '#1D1912'
            }}>
              Temporarily Unable to Load
            </h1>

            <p style={{
              fontSize: '0.9rem',
              color: '#555',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}>
              We encountered a brief interruption while updating your screen. Your booking information is safe in our system.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#1D1912',
                  color: '#FFF',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <RefreshCw size={16} />
                <span>Refresh Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'transparent',
                  color: '#1D1912',
                  padding: '11px 20px',
                  borderRadius: '8px',
                  border: '1.5px solid #1D1912',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Home size={16} />
                <span>Return to Homepage</span>
              </button>

              <a
                href="https://wa.me/254112299384?text=Hello%20Lulu%20Aurelian%20Estate,%20I%20need%20assistance%20with%20my%20reservation."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#16a34a',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginTop: '12px'
                }}
              >
                <MessageSquare size={16} />
                <span>Contact Concierge on WhatsApp (+254 112 299 384)</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
