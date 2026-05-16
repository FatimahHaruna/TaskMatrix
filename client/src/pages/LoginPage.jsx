import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/ui/Brand';
import Icon from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';

const QUADRANT_CARDS = [
  { label: 'Do First',  sub: 'Urgent · Important',         color: 'var(--q1)' },
  { label: 'Schedule',  sub: 'Not urgent · Important',     color: 'var(--q2)' },
  { label: 'Delegate',  sub: 'Urgent · Not important',     color: 'var(--q3)' },
  { label: 'Eliminate', sub: 'Not urgent · Not important', color: 'var(--q4)' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(displayName, email, password, timezone);
        navigate('/welcome');
        return;
      }
      navigate('/board');
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tm-login">
      {/* Brand pane */}
      <div className="tm-login-brand-pane">
        <Brand size="lg" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 52, letterSpacing: '-0.04em', lineHeight: 0.95, maxWidth: 460 }}>
            Sort the noise.<br />
            <span style={{ color: 'var(--ink-3)' }}>Ship what matters.</span>
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 16, maxWidth: 420, marginTop: 18, lineHeight: 1.55 }}>
            TaskMatrix uses the Eisenhower method and AI to keep deadlines, group projects, and life from colliding.
          </p>
          <div className="tm-login-mini-matrix">
            {QUADRANT_CARDS.map((q) => (
              <div key={q.label} className="tm-login-mini-quad" style={{ background: q.color }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>{q.label}</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>{q.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>© 2026 TaskMatrix · Built for the overwhelmed.</div>
      </div>

      {/* Form pane */}
      <div className="tm-login-form-pane">
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, border: '1px solid var(--line-2)', borderRadius: 10, overflow: 'hidden', alignSelf: 'flex-start' }}>
          {['login', 'register'].map((m) => (
            <button key={m} type="button"
              onClick={() => { setMode(m); setError(''); }}
              style={{ padding: '9px 20px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, fontFamily: 'inherit',
                background: mode === m ? 'var(--ink)' : 'transparent',
                color: mode === m ? 'var(--bg)' : 'var(--ink-3)',
                transition: 'all 0.15s' }}>
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 24 }}>
          {mode === 'login' ? 'Sign in to your matrix.' : 'Create your account.'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Google OAuth placeholder — structured for future implementation */}
          <button type="button" className="tm-btn" style={{ padding: '12px 14px', justifyContent: 'center' }}
            onClick={() => navigate('/board')}>
            <Icon name="google" size={18} stroke={0} />
            Continue with Google
          </button>
          <div className="tm-divider-text">or with email</div>

          {mode === 'register' && (
            <div className="tm-form-field">
              <label className="tm-form-label">Display name</label>
              <input className="tm-input" placeholder="Alex Park" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
          )}

          <div className="tm-form-field">
            <label className="tm-form-label">Email</label>
            <input className="tm-input" type="email" placeholder="alex@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="tm-form-field">
            <label className="tm-form-label">
              <span>Password</span>
              {mode === 'login' && <a style={{ color: 'var(--accent)', fontSize: 12, cursor: 'pointer' }}>Forgot?</a>}
            </label>
            <input className="tm-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {mode === 'register' && (
            <div className="tm-form-field">
              <label className="tm-form-label">Timezone</label>
              <input className="tm-input" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC" />
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 12px', background: 'var(--q1-soft)', color: 'var(--q1-ink)', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" className="tm-btn tm-btn-primary" style={{ padding: '12px 14px', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            {!loading && <Icon name="arrow" size={14} />}
          </button>

          <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginTop: 4 }}>
            {mode === 'login' ? (
              <>New here? <a style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setMode('register')}>Create an account</a></>
            ) : (
              <>Already have an account? <a style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setMode('login')}>Sign in</a></>
            )}
          </div>

          {/* Skip auth for demo */}
          <button type="button" className="tm-btn tm-btn-ghost" style={{ justifyContent: 'center', fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}
            onClick={() => navigate('/board')}>
            Continue without account →
          </button>
        </form>
      </div>
    </div>
  );
}
