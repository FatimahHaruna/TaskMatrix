import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ROLES = ['Admin', 'Editor', 'Viewer'];

function useTeamMembers(userId) {
  const key = `tm_team_${userId || 'guest'}`;
  const [members, setMembers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  });
  function save(list) {
    setMembers(list);
    localStorage.setItem(key, JSON.stringify(list));
  }
  return [members, save];
}

function InviteModal({ onClose, onInvite }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleInvite(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/auth/search?email=${encodeURIComponent(email)}`);
      onInvite({ ...res.data, role, joinedAt: new Date().toISOString() });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: 28, width: 400, boxShadow: 'var(--shadow-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>Invite team member</h3>
          <button className="tm-btn-icon" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>
          The person must have a TaskMatrix account. Enter their registered email address.
        </p>
        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="tm-form-field">
            <label className="tm-form-label">Email address</label>
            <input className="tm-input" type="email" placeholder="teammate@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="tm-form-field">
            <label className="tm-form-label">Role</label>
            <select className="tm-input" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {error && (
            <div style={{ padding: '10px 12px', background: 'var(--q1-soft)', color: 'var(--q1-ink)', borderRadius: 8, fontSize: 13 }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="tm-btn tm-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="tm-btn tm-btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Checking…' : 'Send invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { user } = useAuth();
  const [members, saveMembers] = useTeamMembers(user?._id);
  const [showInvite, setShowInvite] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  function handleInvite(member) {
    if (members.find((m) => m.email === member.email)) return;
    saveMembers([...members, member]);
  }

  function changeRole(email, role) {
    saveMembers(members.map((m) => m.email === email ? { ...m, role } : m));
    setEditingRole(null);
  }

  function removeMember(email) {
    if (!confirm('Remove this member from your team?')) return;
    saveMembers(members.filter((m) => m.email !== email));
  }

  const initials = (name) => name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '??';
  const hue = (email) => Math.abs([...email].reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;

  return (
    <div className="tm-app">
      <Sidebar />
      <div className="tm-board-content">
        <Topbar
          title="Team workspace"
          actions={
            <button className="tm-btn tm-btn-sm" onClick={() => setShowInvite(true)}>
              <Icon name="plus" size={13} />Invite member
            </button>
          }
        />
        <div className="tm-board-scroll" style={{ background: 'var(--bg-2)' }}>
          <div style={{ maxWidth: 680 }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div className="tm-hero-date">Collaboration</div>
              <h2 className="tm-hero-heading">{members.length === 0 ? 'Your team workspace' : `${members.length + 1} member${members.length > 0 ? 's' : ''}`}</h2>
              <p style={{ color: 'var(--ink-3)', fontSize: 14, marginTop: 6 }}>
                Invite teammates by their TaskMatrix email to collaborate on tasks.
              </p>
            </div>

            {/* Owner row */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '12px 18px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Team members
              </div>
              {/* Current user as owner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: members.length > 0 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `hsl(230 60% 50%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {initials(user?.displayName || 'Me')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{user?.displayName || 'You'} <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(you)</span></div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{user?.email || ''}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'var(--ink)', color: 'var(--bg)' }}>Owner</span>
              </div>

              {members.map((m, i) => (
                <div key={m.email} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderTop: '1px solid var(--line)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `hsl(${hue(m.email)} 55% 48%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {initials(m.displayName)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.displayName}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{m.email}</div>
                  </div>
                  {editingRole === m.email ? (
                    <select className="tm-input" style={{ fontSize: 12, padding: '4px 8px' }}
                      value={m.role} onChange={(e) => changeRole(m.email, e.target.value)} autoFocus
                      onBlur={() => setEditingRole(null)}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <button onClick={() => setEditingRole(m.email)}
                      style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'var(--bg-2)', color: 'var(--ink-2)', border: '1px solid var(--line-2)', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {m.role}
                    </button>
                  )}
                  <button className="tm-btn-icon" title="Remove member" onClick={() => removeMember(m.email)}>
                    <Icon name="x" size={13} />
                  </button>
                </div>
              ))}
            </div>

            {members.length === 0 && (
              <div style={{ border: '2px dashed var(--line-2)', borderRadius: 'var(--radius)', padding: '40px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
                <Icon name="users" size={32} style={{ opacity: 0.25, marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>No team members yet</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>Invite people by their TaskMatrix email address.</div>
                <button className="tm-btn tm-btn-sm" onClick={() => setShowInvite(true)}>
                  <Icon name="plus" size={13} />Invite first member
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />}
    </div>
  );
}
