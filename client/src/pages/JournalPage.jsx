import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';

function useJournal(userId) {
  const key = `tm_journal_${userId || 'guest'}`;
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  });
  function save(list) { setEntries(list); localStorage.setItem(key, JSON.stringify(list)); }
  return [entries, save];
}

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, saveEntries] = useJournal(user?._id);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = entries.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.body.toLowerCase().includes(search.toLowerCase())
  );

  function createEntry() {
    if (!title.trim() && !body.trim()) return;
    const entry = { id: Date.now().toString(), title: title.trim() || 'Untitled', body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const updated = [entry, ...entries];
    saveEntries(updated);
    setSelected(entry);
    setTitle('');
    setBody('');
    setEditing(false);
  }

  function updateEntry() {
    const updated = entries.map((e) => e.id === selected.id ? { ...e, title, body, updatedAt: new Date().toISOString() } : e);
    saveEntries(updated);
    setSelected({ ...selected, title, body });
    setEditing(false);
  }

  function deleteEntry(id) {
    if (!confirm('Delete this entry?')) return;
    saveEntries(entries.filter((e) => e.id !== id));
    if (selected?.id === id) { setSelected(null); setEditing(false); }
  }

  function openEntry(entry) {
    setSelected(entry);
    setTitle(entry.title);
    setBody(entry.body);
    setEditing(false);
  }

  function startNew() {
    setSelected(null);
    setTitle('');
    setBody('');
    setEditing(true);
  }

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="tm-app">
      <Sidebar />
      <div className="tm-board-content">
        <Topbar title="Journal" actions={
          <button className="tm-btn tm-btn-primary tm-btn-sm" onClick={startNew}>
            <Icon name="plus" size={13} />New entry
          </button>
        } />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 60px)' }}>
          {/* Entries list */}
          <div style={{ width: 280, borderRight: '1px solid var(--line)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--line-2)', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="search" size={13} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                <input style={{ border: 'none', background: 'transparent', outline: 'none', font: 'inherit', fontSize: 13, flex: 1, color: 'var(--ink)' }}
                  placeholder="Search entries…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
              {filtered.length === 0 && (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
                  {entries.length === 0 ? 'No entries yet. Start writing!' : 'No entries match your search.'}
                </div>
              )}
              {filtered.map((e) => (
                <div key={e.id} onClick={() => openEntry(e)}
                  style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 4,
                    background: selected?.id === e.id ? 'var(--ink)' : 'transparent',
                    color: selected?.id === e.id ? 'var(--bg)' : 'var(--ink)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                  <div style={{ fontSize: 11.5, opacity: 0.6 }}>{fmt(e.updatedAt)}</div>
                  <div style={{ fontSize: 12, marginTop: 4, opacity: 0.65, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.body.slice(0, 60)}{e.body.length > 60 ? '…' : ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor / Viewer */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
            {editing ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 36px', overflow: 'auto' }}>
                <input style={{ border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: 'var(--ink)', background: 'transparent', marginBottom: 16, width: '100%' }}
                  placeholder="Entry title…" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea style={{ flex: 1, border: 'none', outline: 'none', font: 'inherit', fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-2)', background: 'transparent', resize: 'none', minHeight: 300 }}
                  placeholder="Write your thoughts, notes, or reflections…" value={body} onChange={(e) => setBody(e.target.value)} autoFocus />
                <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <button className="tm-btn tm-btn-primary tm-btn-sm" onClick={selected ? updateEntry : createEntry}>
                    <Icon name="check" size={13} />{selected ? 'Save changes' : 'Save entry'}
                  </button>
                  <button className="tm-btn tm-btn-ghost tm-btn-sm" onClick={() => { setEditing(false); if (!selected) { setTitle(''); setBody(''); } }}>Cancel</button>
                </div>
              </div>
            ) : selected ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 36px', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', margin: 0 }}>{selected.title}</h1>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="tm-btn tm-btn-sm" onClick={() => setEditing(true)}><Icon name="cog" size={13} />Edit</button>
                    <button className="tm-btn tm-btn-sm" style={{ color: 'var(--q1)' }} onClick={() => deleteEntry(selected.id)}><Icon name="trash" size={13} /></button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 24 }}>
                  {fmt(selected.createdAt)}{selected.updatedAt !== selected.createdAt && ` · Updated ${fmt(selected.updatedAt)}`}
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' }}>{selected.body || <span style={{ color: 'var(--ink-4)' }}>No content.</span>}</div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)' }}>
                <Icon name="notes" size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Select an entry or start writing</div>
                <div style={{ fontSize: 13, marginBottom: 20 }}>Your journal is private and stored on this device.</div>
                <button className="tm-btn tm-btn-sm" onClick={startNew}><Icon name="plus" size={13} />New entry</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
