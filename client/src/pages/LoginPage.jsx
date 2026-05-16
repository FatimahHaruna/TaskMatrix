import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/ui/Brand';
import Icon from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import { authApiExtra } from '../services/api';

const QUADRANT_CARDS = [
  { label: 'Do First',  sub: 'Urgent · Important',         color: 'var(--q1)' },
  { label: 'Schedule',  sub: 'Not urgent · Important',     color: 'var(--q2)' },
  { label: 'Delegate',  sub: 'Urgent · Not important',     color: 'var(--q3)' },
  { label: 'Eliminate', sub: 'Not urgent · Not important', color: 'var(--q4)' },
];

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', 'var(--q1)', 'var(--q3)', 'var(--q2)', 'var(--q4)'];
const STRENGTH_HINTS = [
  '',
  'Add uppercase letter, number, and special character (!@#$%)',
  'Add number and special character (!@#$%)',
  'Add special character (!@#$%)',
  'Password meets all requirements',
];

function ForgotPasswordModal({ onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  // step: 'email' | 'reset' | 'done'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwdStrength = getPasswordStrength(newPassword);

  async function handleRequestToken(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApiExtra.forgotPassword(email);
      // In demo mode the token is returned directly; pre-fill it
      setToken(data.resetToken || '');
      setStep('reset');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not send reset link. Check the email address.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    if (pwdStrength < 4) { setError('Password does not meet requirements.'); return; }
    setLoading(true);
    try {
      await authApiExtra.resetPassword(token, newPassword);
      // Auto sign-in after reset
      await login(email, newPassword);
      onClose();
      navigate('/board');
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed. The token may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: 28, width: 400, boxShadow: 'var(--shadow-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
            {step === 'email' ? 'Reset password' : 'Set new password'}
          </h3>
          <button className="tm-btn-icon" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        {step === 'email' && (
          <form onSubmit={handleRequestToken} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
              Enter your registered email address. A reset code will be generated for you.
            </p>
            <div className="tm-form-field">
              <label className="tm-form-label">Email address</label>
              <input className="tm-input" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            {error && <div style={{ padding: '10px 12px', background: 'var(--q1-soft)', color: 'var(--q1-ink)', borderRadius: 8, fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="button" className="tm-btn tm-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="tm-btn tm-btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Sending…' : 'Get reset code'}
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
              Your reset code has been generated. Enter it below along with your new password.
            </p>
            <div className="tm-form-field">
              <label className="tm-form-label">Reset code</label>
              <input className="tm-input" value={token} onChange={(e) => setToken(e.target.value)}
                placeholder="Paste reset code" required style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
            <div className="tm-form-field">
              <label className="tm-form-label">New password</label>
              <input className="tm-input" type="password" placeholder="••••••••" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} required autoFocus autoComplete="new-password" />
              {newPassword.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ background: 'var(--bg-2)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                    <div className="tm-pwd-strength-bar" style={{ width: `${(pwdStrength / 4) * 100}%`, background: STRENGTH_COLOR[pwdStrength] }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11.5, color: STRENGTH_COLOR[pwdStrength], fontWeight: 600 }}>{STRENGTH_LABEL[pwdStrength]}</span>
                    {pwdStrength < 4 && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{STRENGTH_HINTS[pwdStrength]}</span>}
                  </div>
                </div>
              )}
            </div>
            {error && <div style={{ padding: '10px 12px', background: 'var(--q1-soft)', color: 'var(--q1-ink)', borderRadius: 8, fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="button" className="tm-btn tm-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setStep('email'); setError(''); }}>Back</button>
              <button type="submit" className="tm-btn tm-btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                disabled={loading || pwdStrength < 4}>
                {loading ? 'Resetting…' : 'Reset & sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const pwdStrength = mode === 'register' ? getPasswordStrength(password) : 0;

  function validateForm() {
    if (mode === 'register') {
      if (!displayName.trim()) return 'Display name is required.';
      if (password.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
      if (!/[0-9]/.test(password)) return 'Password must include a number.';
      if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character (!@#$%^&*).';
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/board');
      } else {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        await register(displayName, email, password, tz);
        navigate('/welcome');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tm-login">
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

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
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, border: '1px solid var(--line-2)', borderRadius: 10, overflow: 'hidden', alignSelf: 'flex-start' }}>
          {['login', 'register'].map((m) => (
            <button key={m} type="button"
              onClick={() => { setMode(m); setError(''); setPassword(''); }}
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
              {mode === 'login' && (
                <button type="button" style={{ color: 'var(--accent)', fontSize: 12, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
                  onClick={() => setShowForgot(true)}>
                  Forgot password?
                </button>
              )}
            </label>
            <div style={{ position: 'relative' }}>
              <input className="tm-input" type={showPassword ? 'text' : 'password'}
                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ width: '100%', paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 0 }}>
                <Icon name={showPassword ? 'eye' : 'eye'} size={14} />
              </button>
            </div>
            {mode === 'register' && password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ background: 'var(--bg-2)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                  <div className="tm-pwd-strength-bar"
                    style={{ width: `${(pwdStrength / 4) * 100}%`, background: STRENGTH_COLOR[pwdStrength] }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  <span style={{ fontSize: 11.5, color: STRENGTH_COLOR[pwdStrength], fontWeight: 600 }}>
                    {STRENGTH_LABEL[pwdStrength]}
                  </span>
                  {pwdStrength < 4 && (
                    <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{STRENGTH_HINTS[pwdStrength]}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding: '10px 12px', background: 'var(--q1-soft)', color: 'var(--q1-ink)', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" className="tm-btn tm-btn-primary" style={{ padding: '12px 14px', justifyContent: 'center', marginTop: 4 }}
            disabled={loading || (mode === 'register' && pwdStrength < 4)}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            {!loading && <Icon name="arrow" size={14} />}
          </button>

          {mode === 'register' && pwdStrength < 4 && password.length > 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)', textAlign: 'center' }}>
              Complete password requirements to create account
            </div>
          )}

          <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginTop: 4 }}>
            {mode === 'login' ? (
              <>New here? <a style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setMode('register')}>Create an account</a></>
            ) : (
              <>Already have an account? <a style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setMode('login')}>Sign in</a></>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
