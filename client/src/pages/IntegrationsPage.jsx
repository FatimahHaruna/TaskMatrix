import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/ui/Icon';
import Toggle from '../components/ui/Toggle';

function IntegrationCard({ icon, name, desc, connected, badge, children }) {
  const [on, setOn] = useState(connected);
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: children ? 16 : 0 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={20} style={{ color: 'var(--ink-2)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
            {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: 'var(--q4-soft)', color: 'var(--q4-ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{badge}</span>}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
        </div>
        <Toggle on={on} onChange={setOn} />
      </div>
      {children && on && <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>{children}</div>}
    </div>
  );
}

function SectionHeader({ title, desc }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', margin: 0 }}>{title}</h3>
      {desc && <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>{desc}</p>}
    </div>
  );
}

function FieldRow({ label, placeholder, value, type = 'text', hint }) {
  const [val, setVal] = useState(value || '');
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        type={type}
        className="tm-input"
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        style={{ width: '100%', maxWidth: 420 }}
      />
      {hint && <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function IntegrationsPage() {
  const [csvDone, setCsvDone] = useState(false);
  const [webhookLog, setWebhookLog] = useState([]);

  function mockCsvImport() {
    setCsvDone(true);
    setTimeout(() => setCsvDone(false), 3000);
  }

  function testWebhook() {
    const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setWebhookLog((prev) => [`[${ts}] POST → https://hooks.example.com/taskmatrix  200 OK`, ...prev].slice(0, 5));
  }

  return (
    <div className="tm-app">
      <Sidebar />
      <div className="tm-board-content">
        <Topbar title="Integrations" />
        <div className="tm-board-scroll" style={{ background: 'var(--bg)' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 28 }}>
              <div className="tm-hero-date">Connect your tools</div>
              <h2 className="tm-hero-heading">Integrations</h2>
              <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: '6px 0 0' }}>Sync tasks with your calendar, import data, and automate workflows.</p>
            </div>

            {/* Calendar */}
            <section style={{ marginBottom: 32 }}>
              <SectionHeader title="Calendar sync" desc="Two-way sync: due dates appear as calendar events; events can create tasks." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <IntegrationCard
                  icon="calendar"
                  name="Google Calendar"
                  desc="Sync due dates and time blocks to your Google Calendar automatically."
                  connected={false}
                  badge="OAuth"
                >
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
                    Click "Connect with Google" to authorise TaskMatrix to read and write calendar events.
                  </div>
                  <button className="tm-btn tm-btn-sm" onClick={() => alert('Google OAuth not yet wired — add GOOGLE_CLIENT_ID to server .env to enable.')}>
                    <Icon name="link" size={13} />Connect with Google
                  </button>
                </IntegrationCard>

                <IntegrationCard
                  icon="calendar"
                  name="Outlook / Microsoft 365"
                  desc="Connect via Microsoft Graph API to sync with Outlook Calendar."
                  connected={false}
                  badge="OAuth"
                >
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
                    Authorise via Microsoft identity platform. Requires an Azure app registration.
                  </div>
                  <button className="tm-btn tm-btn-sm" onClick={() => alert('Microsoft OAuth not yet wired — add AZURE_CLIENT_ID to server .env to enable.')}>
                    <Icon name="link" size={13} />Connect with Microsoft
                  </button>
                </IntegrationCard>

                <IntegrationCard
                  icon="download"
                  name="iCal / CalDAV feed"
                  desc="Subscribe to a read-only .ics feed of your due dates in any calendar app."
                  connected={true}
                  badge="Live"
                >
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>Your personal feed URL</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input readOnly className="tm-input" value="https://taskmatrix.app/cal/feed/demo-user-token.ics" style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                      <button className="tm-btn tm-btn-sm" onClick={() => navigator.clipboard?.writeText('https://taskmatrix.app/cal/feed/demo-user-token.ics')}>Copy</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Paste this URL into Google Calendar → "Other calendars → From URL".</div>
                </IntegrationCard>
              </div>
            </section>

            {/* CSV */}
            <section style={{ marginBottom: 32 }}>
              <SectionHeader title="Import & export" desc="Move tasks in and out of TaskMatrix using CSV files." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Import from CSV</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.5 }}>
                    Upload a CSV with columns: <code>title, quadrant, priority, dueDate, labels, notes</code>. Rows with missing quadrant are placed in "Do First".
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <label className="tm-btn tm-btn-sm" style={{ cursor: 'pointer' }}>
                      <Icon name="upload" size={13} />Choose file
                      <input type="file" accept=".csv" style={{ display: 'none' }} onChange={mockCsvImport} />
                    </label>
                    <a
                      href="data:text/csv;charset=utf-8,title%2Cquadrant%2Cpriority%2CdueDate%2Clabels%2Cnotes%0AExample%20task%2Cq1%2Chigh%2C2026-06-01%2Cwork%2CAdd%20your%20notes%20here"
                      download="taskmatrix-template.csv"
                      className="tm-btn tm-btn-ghost tm-btn-sm"
                    >
                      <Icon name="download" size={13} />Download template
                    </a>
                    {csvDone && <span style={{ fontSize: 13, color: 'var(--q4)', fontWeight: 500 }}>✓ Import queued (demo)</span>}
                  </div>
                </div>

                <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Export to CSV</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 14 }}>
                    Download all tasks (active + completed) as a spreadsheet. Trash is excluded.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href="/analytics" className="tm-btn tm-btn-sm">
                      <Icon name="download" size={13} />Export from Analytics page
                    </a>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 8 }}>The "Export CSV" button on the Analytics page includes all tasks with full metadata.</div>
                </div>
              </div>
            </section>

            {/* Webhooks */}
            <section style={{ marginBottom: 32 }}>
              <SectionHeader title="Webhooks" desc="Send real-time POST requests to your own endpoint when tasks change." />
              <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 20 }}>
                <FieldRow
                  label="Endpoint URL"
                  placeholder="https://hooks.example.com/taskmatrix"
                  hint="Receives a JSON payload for task.created, task.updated, task.deleted, and task.completed events."
                />
                <FieldRow
                  label="Secret token (HMAC-SHA256)"
                  placeholder="whsec_••••••••"
                  type="password"
                  hint="Used to sign requests. Verify the X-TaskMatrix-Signature header in your handler."
                />
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>Trigger events</label>
                  {['task.created', 'task.updated', 'task.completed', 'task.deleted', 'comment.added'].map((ev) => (
                    <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)', marginBottom: 6, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={ev !== 'comment.added'} style={{ accentColor: 'var(--ink)' }} />
                      <code style={{ fontSize: 12 }}>{ev}</code>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <button className="tm-btn tm-btn-primary tm-btn-sm" onClick={() => alert('Webhook saved (demo — server endpoint not yet wired).')}>Save webhook</button>
                  <button className="tm-btn tm-btn-sm" onClick={testWebhook}>Send test ping</button>
                </div>
                {webhookLog.length > 0 && (
                  <div style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--q4)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {webhookLog.map((l, i) => <div key={i}>{l}</div>)}
                  </div>
                )}
              </div>
            </section>

            {/* API */}
            <section style={{ marginBottom: 32 }}>
              <SectionHeader title="Developer API" desc="Access TaskMatrix programmatically with a personal access token." />
              <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 20 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>Personal access token</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input readOnly className="tm-input" type="password" value="tm_pat_demo000000000000000000000000" style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <button className="tm-btn tm-btn-sm" onClick={() => alert('Token regeneration disabled in demo.')}>Regenerate</button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 6 }}>Include as <code>Authorization: Bearer &lt;token&gt;</code> in your requests.</div>
                </div>
                <div style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                  <div style={{ color: 'var(--ink-4)' }}># List your tasks</div>
                  <div>curl https://taskmatrix.app/api/tasks \</div>
                  <div>&nbsp;&nbsp;-H "Authorization: Bearer tm_pat_demo..."</div>
                </div>
                <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--ink-3)' }}>
                  Base URL: <code>http://localhost:5000/api</code> · Endpoints: <code>/tasks</code> <code>/ai/suggest</code> <code>/auth/me</code>
                </div>
              </div>
            </section>

            {/* Notice */}
            <div style={{ background: 'var(--bg-2)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12.5, color: 'var(--ink-3)' }}>
              <Icon name="sparkles" size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <span>Calendar OAuth and webhook delivery require server-side configuration. Add the relevant API keys to <code>server/.env</code> and restart the server to activate.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
