import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Toggle from '../components/ui/Toggle';
import Icon from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';

const SETTING_SECTIONS = ['Profile', 'Account & security', 'Notifications', 'AI suggestions', 'Appearance', 'Integrations', 'Data export', 'Danger zone'];

function SettingsCard({ title, children }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 20 }}>
      {title && <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.015em', marginBottom: 16 }}>{title}</h3>}
      {children}
    </div>
  );
}

function SettingsRow({ label, desc, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--line)' }}>
      <div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('Profile');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [timezone, setTimezone]       = useState(user?.timezone || 'UTC');
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [darkMode, setDarkMode]       = useState(() => localStorage.getItem('tm-dark-mode') === 'true');

  const [aiPrefs, setAiPrefs] = useState({
    autoSuggestQuadrant:       user?.aiPrefs?.autoSuggestQuadrant       ?? true,
    suggestTitleImprovements:  user?.aiPrefs?.suggestTitleImprovements   ?? true,
    suggestSubtasks:           user?.aiPrefs?.suggestSubtasks            ?? false,
  });

  const [notifPrefs, setNotifPrefs] = useState({
    inApp: user?.notificationPrefs?.inApp ?? true,
    email: user?.notificationPrefs?.email ?? false,
  });

  function toggleDarkMode(v) {
    setDarkMode(v);
    localStorage.setItem('tm-dark-mode', v ? 'true' : 'false');
    if (v) document.documentElement.classList.add('dark-mode');
    else document.documentElement.classList.remove('dark-mode');
    if (updateUser) updateUser({ darkMode: v }).catch(() => {});
  }

  async function saveProfile() {
    setSaving(true);
    try {
      if (updateUser) await updateUser({ displayName, timezone, aiPrefs, notificationPrefs: notifPrefs });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  }

  const initials = displayName.trim().split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="tm-app">
      <Sidebar />
      <div className="tm-board-content">
        <Topbar title="Settings" />

        <div className="tm-board-scroll" style={{ background: 'var(--bg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 28, maxWidth: 1000 }}>
            {/* Settings nav */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 4 }}>
              {SETTING_SECTIONS.map((s) => (
                <button key={s}
                  onClick={() => setActiveSection(s)}
                  style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
                    background: activeSection === s ? 'var(--ink)' : 'transparent',
                    color: activeSection === s ? 'var(--bg)' : 'var(--ink-2)',
                    transition: 'all 0.1s' }}>
                  {s}
                </button>
              ))}
            </nav>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, letterSpacing: '-0.03em', margin: 0 }}>{activeSection}</h2>
                <p style={{ color: 'var(--ink-3)', margin: '6px 0 0', fontSize: 14 }}>
                  {activeSection === 'Profile' && 'This is how others on shared boards will see you.'}
                  {activeSection === 'AI suggestions' && 'Control how AI helps you triage and prioritize tasks.'}
                  {activeSection === 'Notifications' && 'Choose how and when TaskMatrix notifies you.'}
                </p>
              </div>

              {/* PROFILE */}
              {activeSection === 'Profile' && (
                <>
                  <SettingsCard>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--ink)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{displayName}</div>
                        <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 2 }}>{user?.email || ''} · Student plan · {timezone}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button className="tm-btn tm-btn-sm">Upload photo</button>
                          <button className="tm-btn tm-btn-ghost tm-btn-sm">Remove</button>
                        </div>
                      </div>
                    </div>
                  </SettingsCard>

                  <SettingsCard title="Display name & timezone">
                    <SettingsRow label="Display name" desc="Shown on tasks and comments">
                      <input className="tm-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ minWidth: 220 }} />
                    </SettingsRow>
                    <SettingsRow label="Timezone" desc="Used for due date reminders">
                      <input className="tm-input" value={timezone} onChange={(e) => setTimezone(e.target.value)} style={{ minWidth: 220 }} />
                    </SettingsRow>
                    <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                      <button className="tm-btn tm-btn-primary tm-btn-sm" onClick={saveProfile} disabled={saving}>
                        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
                      </button>
                    </div>
                  </SettingsCard>
                </>
              )}

              {/* AI SUGGESTIONS */}
              {activeSection === 'AI suggestions' && (
                <SettingsCard title="AI suggestions">
                  <SettingsRow label="Auto-suggest quadrant on task creation" desc="AI analyses title and notes as you type">
                    <Toggle on={aiPrefs.autoSuggestQuadrant} onChange={(v) => setAiPrefs({ ...aiPrefs, autoSuggestQuadrant: v })} />
                  </SettingsRow>
                  <SettingsRow label="Suggest title improvements" desc="Tips for clearer, more actionable task titles">
                    <Toggle on={aiPrefs.suggestTitleImprovements} onChange={(v) => setAiPrefs({ ...aiPrefs, suggestTitleImprovements: v })} />
                  </SettingsRow>
                  <SettingsRow label="Suggest subtasks for vague tasks" desc="Break large tasks into concrete steps">
                    <Toggle on={aiPrefs.suggestSubtasks} onChange={(v) => setAiPrefs({ ...aiPrefs, suggestSubtasks: v })} />
                  </SettingsRow>
                  <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 10, fontSize: 12.5, color: 'var(--ink-3)', display: 'flex', gap: 8 }}>
                    <Icon name="sparkles" size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                    Currently using a local keyword-based AI engine. Connect a real Claude/OpenAI API key in the server <code>.env</code> to upgrade.
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <button className="tm-btn tm-btn-primary tm-btn-sm" onClick={saveProfile}>Save preferences</button>
                  </div>
                </SettingsCard>
              )}

              {/* NOTIFICATIONS */}
              {activeSection === 'Notifications' && (
                <SettingsCard title="Notification channels">
                  <SettingsRow label="In-app notifications" desc="Show alerts in the Notifications page">
                    <Toggle on={notifPrefs.inApp} onChange={(v) => setNotifPrefs({ ...notifPrefs, inApp: v })} />
                  </SettingsRow>
                  <SettingsRow label="Email notifications" desc="Receive a daily digest (mocked for now)">
                    <Toggle on={notifPrefs.email} onChange={(v) => setNotifPrefs({ ...notifPrefs, email: v })} />
                  </SettingsRow>
                  <div style={{ marginTop: 14 }}>
                    <button className="tm-btn tm-btn-primary tm-btn-sm" onClick={saveProfile}>Save preferences</button>
                  </div>
                </SettingsCard>
              )}

              {/* DANGER ZONE */}
              {activeSection === 'Danger zone' && (
                <SettingsCard title="Danger zone">
                  <SettingsRow label="Sign out" desc="Sign out of this session">
                    <button className="tm-btn tm-btn-sm" onClick={logout}>Sign out</button>
                  </SettingsRow>
                  <SettingsRow label="Delete account" desc="Permanently delete your account and all data">
                    <button className="tm-btn tm-btn-sm" style={{ color: 'var(--q1)', borderColor: 'var(--q1-soft)' }}
                      onClick={() => alert('Account deletion is disabled in this demo.')}>
                      Delete account
                    </button>
                  </SettingsRow>
                </SettingsCard>
              )}

              {/* APPEARANCE */}
              {activeSection === 'Appearance' && (
                <>
                  <SettingsCard title="Theme">
                    <SettingsRow label="Dark mode" desc="Switch between light and dark interface">
                      <Toggle on={darkMode} onChange={toggleDarkMode} />
                    </SettingsRow>
                  </SettingsCard>
                  <SettingsCard title="Quadrant colours">
                    <SettingsRow label="Colour scheme" desc="Distinct colours are used by default to differentiate quadrants">
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['var(--q1)', 'var(--q2)', 'var(--q3)', 'var(--q4)'].map((c) => (
                          <span key={c} style={{ width: 18, height: 18, borderRadius: 4, background: c, display: 'inline-block' }} />
                        ))}
                      </div>
                    </SettingsRow>
                  </SettingsCard>
                </>
              )}

              {/* ACCOUNT & SECURITY */}
              {activeSection === 'Account & security' && (
                <SettingsCard title="Account & security">
                  <SettingsRow label="Email address" desc="Your login email">
                    <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{user?.email || ''}</span>
                  </SettingsRow>
                  <SettingsRow label="Password" desc="Change your account password">
                    <button className="tm-btn tm-btn-sm" onClick={() => alert('Use the "Forgot password?" link on the login page to reset your password.')}>
                      Change password
                    </button>
                  </SettingsRow>

                </SettingsCard>
              )}

              {/* DEFAULT PLACEHOLDER */}
              {!['Profile', 'AI suggestions', 'Notifications', 'Danger zone', 'Appearance', 'Account & security'].includes(activeSection) && (
                <SettingsCard>
                  <div style={{ color: 'var(--ink-4)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
                    <Icon name="cog" size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
                    <div>{activeSection} settings coming soon.</div>
                  </div>
                </SettingsCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
