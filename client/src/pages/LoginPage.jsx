import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/ui/Brand';
import Icon from '../components/ui/Icon';

const QUADRANT_CARDS = [
  { label: 'Do First',  sub: 'Urgent · Important',         color: 'var(--q1)' },
  { label: 'Schedule',  sub: 'Not urgent · Important',     color: 'var(--q2)' },
  { label: 'Delegate',  sub: 'Urgent · Not important',     color: 'var(--q3)' },
  { label: 'Eliminate', sub: 'Not urgent · Not important', color: 'var(--q4)' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    // Auth not implemented — go straight to board.
    navigate('/board');
  }

  return (
    <div className="tm-login">
      {/* Brand pane */}
      <div className="tm-login-brand-pane">
        <Brand size="lg" />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 52,
            letterSpacing: '-0.04em', lineHeight: 0.95,
            maxWidth: 460,
          }}>
            Sort the noise.<br />
            <span style={{ color: 'var(--ink-3)' }}>Ship what matters.</span>
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 16, maxWidth: 420, marginTop: 18, lineHeight: 1.55 }}>
            TaskMatrix uses the Eisenhower method and AI suggestions to keep deadlines, group projects, and life from colliding.
          </p>

          {/* Mini 2×2 */}
          <div className="tm-login-mini-matrix">
            {QUADRANT_CARDS.map((q) => (
              <div
                key={q.label}
                className="tm-login-mini-quad"
                style={{ background: q.color }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>
                  {q.label}
                </div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>{q.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>© 2026 TaskMatrix · Built for the overwhelmed.</div>
      </div>

      {/* Form pane */}
      <div className="tm-login-form-pane">
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 8 }}>Welcome back</div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34,
          letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 28,
        }}>
          Sign in to your matrix.
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            className="tm-btn"
            style={{ padding: '12px 14px', justifyContent: 'center' }}
            onClick={() => navigate('/board')}
          >
            <Icon name="google" size={18} stroke={0} />
            Continue with Google
          </button>

          <div className="tm-divider-text">or with email</div>

          <div className="tm-form-field">
            <label className="tm-form-label">Email</label>
            <input
              className="tm-input"
              type="email"
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="tm-form-field">
            <label className="tm-form-label">
              <span>Password</span>
              <a style={{ color: 'var(--accent)', fontSize: 12 }}>Forgot?</a>
            </label>
            <input
              className="tm-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="tm-btn tm-btn-primary"
            style={{ padding: '12px 14px', justifyContent: 'center', marginTop: 6 }}
          >
            Sign in
            <Icon name="arrow" size={14} />
          </button>

          <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginTop: 4 }}>
            New here?{' '}
            <a style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/board')}>
              Create an account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
