import { useState, useEffect, useRef } from 'react';
import Icon from '../ui/Icon';
import Avatar, { PEOPLE, personById } from '../ui/Avatar';
import { QUADRANTS } from '../board/Quadrant';
import { useTaskContext } from '../../context/TaskContext';
import { suggestQuadrant, suggestSubtasks, checkMisclassification } from '../../services/aiService';

const PRIORITIES = ['High', 'Medium', 'Low'];
const Q_COLORS = {
  q1: { color: 'var(--q1)', soft: 'var(--q1-soft)' },
  q2: { color: 'var(--q2)', soft: 'var(--q2-soft)' },
  q3: { color: 'var(--q3)', soft: 'var(--q3-soft)' },
  q4: { color: 'var(--q4)', soft: 'var(--q4-soft)' },
};
const CONF_COLORS = { High: '#10b981', Medium: '#f59e0b', Low: '#6b7280' };
const TABS = ['details', 'comments', 'activity'];

export default function TaskModal({ task, defaultQuadrant, onClose }) {
  const { createTask, updateTask, addComment } = useTaskContext();
  const isEditing = !!task;

  const [tab, setTab] = useState('details');
  const [title, setTitle]       = useState(task?.title ?? '');
  const [notes, setNotes]       = useState(task?.notes ?? '');
  const [quadrant, setQuadrant] = useState(task?.quadrant ?? defaultQuadrant ?? 'q1');
  const [priority, setPriority] = useState(task?.priority ?? 'Medium');
  const [dueDate, setDueDate]   = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [dueTime, setDueTime]   = useState(task?.dueTime ?? '');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels]     = useState(task?.labels ?? []);
  const [assignee, setAssignee] = useState(task?.assignee ?? 'me');
  const [commentBody, setCommentBody] = useState('');

  const [aiLoading, setAiLoading]   = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showQPicker, setShowQPicker]   = useState(false);
  const [subtaskList, setSubtaskList]   = useState([]);
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [titleHints, setTitleHints] = useState([]);
  const [misclassifyWarning, setMisclassifyWarning] = useState(null);
  const [saving, setSaving]     = useState(false);

  const titleRef = useRef();
  const debounceRef = useRef();
  const dateInputRef = useRef();

  useEffect(() => { titleRef.current?.focus(); }, []);

  // FR-413: Check for misclassified tasks when opening an existing task
  useEffect(() => {
    if (!isEditing || !task?.title || !task?.quadrant) return;
    checkMisclassification(task.title, task.notes, task.quadrant).then((result) => {
      if (result?.isMisclassified) setMisclassifyWarning(result);
    });
  }, [isEditing, task]);

  useEffect(() => {
    if (isEditing || title.trim().length < 10) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const s = await suggestQuadrant(title, notes);
        if (s) { setAiSuggestion(s); setTitleHints(s.titleHints || []); }
      } finally { setAiLoading(false); }
    }, 700);
    return () => clearTimeout(debounceRef.current);
  }, [title, notes, isEditing]);

  async function handleSubtasks() {
    setSubtasksLoading(true);
    try {
      const list = await suggestSubtasks(title, notes);
      setSubtaskList(list);
    } finally { setSubtasksLoading(false); }
  }

  function applyAi() { if (aiSuggestion) { setQuadrant(aiSuggestion.quadrant); setAiSuggestion(null); } }

  function addLabel(e) {
    if ((e.key === 'Enter' || e.key === ',') && labelInput.trim()) {
      e.preventDefault();
      const clean = labelInput.trim().replace(/^#/, '');
      if (!labels.includes(clean)) setLabels([...labels, clean]);
      setLabelInput('');
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = { title: title.trim(), notes, quadrant, priority, labels, dueDate: dueDate || null, dueTime, assignee };
      isEditing ? await updateTask(task._id, data) : await createTask(data);
      onClose();
    } finally { setSaving(false); }
  }

  async function handleAddComment() {
    if (!commentBody.trim() || !task) return;
    await addComment(task._id, commentBody.trim());
    setCommentBody('');
  }

  function handleKey(e) {
    if (e.key === 'Escape') onClose();
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(e);
  }

  const selectedQ = QUADRANTS.find((q2) => q2.id === quadrant);
  const qc = Q_COLORS[quadrant];

  return (
    <div className="tm-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} onKeyDown={handleKey}>
      <form className="tm-modal" onSubmit={handleSubmit} style={{ maxHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="tm-modal-header">
          <span className="tm-modal-label">{isEditing ? 'Edit task' : 'New task'}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {isEditing && TABS.map((t) => (
              <button key={t} type="button"
                className={`tm-btn tm-btn-sm${tab === t ? '' : ' tm-btn-ghost'}`}
                style={{ textTransform: 'capitalize', padding: '4px 10px' }}
                onClick={() => setTab(t)}>{t}</button>
            ))}
            <button type="button" className="tm-btn-icon" onClick={onClose}><Icon name="x" size={15} /></button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* DETAILS TAB */}
          {tab === 'details' && (
            <>
              <div className="tm-modal-body">
                <textarea ref={titleRef} className="tm-modal-title-input"
                  placeholder="What needs to be done?"
                  value={title} onChange={(e) => setTitle(e.target.value)} rows={2}
                  style={{ height: 'auto' }}
                  onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
                <textarea className="tm-modal-notes-input"
                  placeholder="Add notes…"
                  value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>

              {/* Title hints */}
              {titleHints.length > 0 && (
                <div style={{ margin: '0 14px 8px', padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 10, fontSize: 12.5, color: 'var(--ink-3)' }}>
                  <strong style={{ color: 'var(--ink-2)' }}>💡 Title hint: </strong>{titleHints[0]}
                </div>
              )}

              {/* FR-413: Misclassification warning */}
              {isEditing && misclassifyWarning && (
                <div style={{ margin: '0 14px 8px', padding: '12px 14px', background: 'var(--q3-soft)', borderRadius: 10, fontSize: 12.5, color: 'var(--q3-ink)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Icon name="sparkles" size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <strong>AI notice:</strong> This task may belong in <strong>{misclassifyWarning.suggestedLabel}</strong> instead of <strong>{misclassifyWarning.currentLabel}</strong>.
                    <div style={{ fontSize: 12, marginTop: 3, opacity: 0.85 }}>{misclassifyWarning.reason}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="tm-btn tm-btn-sm" style={{ fontSize: 11 }}
                      onClick={() => { setQuadrant(misclassifyWarning.suggestedQuadrant); setMisclassifyWarning(null); }}>
                      Move
                    </button>
                    <button className="tm-btn-icon" onClick={() => setMisclassifyWarning(null)}><Icon name="x" size={11} /></button>
                  </div>
                </div>
              )}

              {/* AI suggestion */}
              {(aiLoading || aiSuggestion) && (
                <div className="tm-ai-suggest">
                  <div className="tm-ai-icon"><Icon name="sparkles" size={15} /></div>
                  <div style={{ minWidth: 0 }}>
                    {aiLoading ? (
                      <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Analysing task…</div>
                    ) : (
                      <>
                        <div className="tm-ai-suggest-heading">
                          <strong style={{ fontSize: 13.5 }}>AI suggests:</strong>
                          <span className="tm-ai-quadrant-badge" style={{ background: QUADRANTS.find((q2) => q2.id === aiSuggestion.quadrant)?.color }}>
                            <span className="tm-tag-dot" style={{ background: 'white' }} />
                            {aiSuggestion.quadrantLabel}
                          </span>
                          <span className="tm-ai-confidence">
                            <span className="tm-tag-dot" style={{ background: CONF_COLORS[aiSuggestion.confidence] }} />
                            {aiSuggestion.confidence} confidence
                          </span>
                        </div>
                        <p className="tm-ai-reason">{aiSuggestion.reason}</p>
                        <div className="tm-ai-actions">
                          <button type="button" className="tm-btn tm-btn-primary tm-btn-sm" onClick={applyAi}>
                            <Icon name="check" size={12} />Apply
                          </button>
                          <button type="button" className="tm-btn tm-btn-sm" onClick={() => { setShowQPicker(true); setAiSuggestion(null); }}>
                            Override
                          </button>
                          <button type="button" className="tm-btn tm-btn-ghost tm-btn-sm" onClick={handleSubtasks} disabled={subtasksLoading}>
                            {subtasksLoading ? 'Thinking…' : 'Suggest subtasks'}
                          </button>
                          <button type="button" className="tm-btn tm-btn-ghost tm-btn-sm" onClick={() => setAiSuggestion(null)}>
                            Dismiss
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Subtask suggestions */}
              {subtaskList.length > 0 && (
                <div style={{ margin: '0 14px 10px', padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Suggested subtasks
                  </div>
                  {subtaskList.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13.5, borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                      <Icon name="check" size={12} style={{ color: 'var(--ink-4)' }} />{s}
                    </div>
                  ))}
                  <button type="button" className="tm-btn tm-btn-ghost tm-btn-sm" style={{ marginTop: 8 }} onClick={() => setSubtaskList([])}>Dismiss</button>
                </div>
              )}

              {/* Quadrant picker */}
              {showQPicker && (
                <div style={{ padding: '0 14px 12px' }}>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8, fontWeight: 500 }}>Select quadrant</div>
                  <div className="tm-quad-select-grid">
                    {QUADRANTS.map((q2) => (
                      <button key={q2.id} type="button"
                        className={`tm-quad-select-item${quadrant === q2.id ? ' is-selected' : ''}`}
                        style={{ '--q-color': Q_COLORS[q2.id].color, '--q-soft': Q_COLORS[q2.id].soft }}
                        onClick={() => { setQuadrant(q2.id); setShowQPicker(false); }}>
                        <span className="tm-tag-dot" style={{ width: 8, height: 8, background: Q_COLORS[q2.id].color }} />
                        {q2.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta row */}
              <div className="tm-modal-meta">
                <button type="button" className="tm-btn tm-btn-sm"
                  style={{ background: qc.soft, borderColor: 'transparent', color: qc.color }}
                  onClick={() => setShowQPicker((v) => !v)}>
                  <span className="tm-tag-dot" style={{ background: qc.color }} />
                  {selectedQ?.label}
                </button>

                <button type="button" className="tm-btn tm-btn-sm" style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}>
                  <Icon name="calendar" size={13} />
                  {dueDate ? new Date(dueDate + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Set due date'}
                </button>
                <input ref={dateInputRef} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />
                {dueDate && (
                  <button type="button" className="tm-btn-icon" title="Clear date"
                    onClick={() => { setDueDate(''); setDueTime(''); }}
                    style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                    <Icon name="x" size={11} />
                  </button>
                )}

                <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)}
                  className="tm-btn tm-btn-sm"
                  style={{ cursor: 'pointer', width: dueTime ? 'auto' : 80 }}
                  title="Due time" />

                <select className="tm-btn tm-btn-sm" value={priority} onChange={(e) => setPriority(e.target.value)}
                  style={{ cursor: 'pointer', appearance: 'none' }}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p} priority</option>)}
                </select>

                <select className="tm-btn tm-btn-sm" value={assignee} onChange={(e) => setAssignee(e.target.value)}
                  style={{ cursor: 'pointer', appearance: 'none' }}>
                  <option value="me">Assigned to me</option>
                  {PEOPLE.filter((p) => p.id !== 'me').map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                {labels.map((l) => (
                  <button key={l} type="button" className="tm-chip" onClick={() => setLabels(labels.filter((x) => x !== l))}>
                    #{l} <Icon name="x" size={10} />
                  </button>
                ))}
                <input className="tm-btn tm-btn-sm tm-btn-ghost" placeholder="+ label" value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)} onKeyDown={addLabel}
                  style={{ minWidth: 60, width: 'auto', cursor: 'text' }} />
              </div>
            </>
          )}

          {/* COMMENTS TAB */}
          {tab === 'comments' && isEditing && (
            <div style={{ padding: '12px 18px' }}>
              {(task.comments || []).length === 0 && (
                <p style={{ color: 'var(--ink-4)', fontSize: 13 }}>No comments yet.</p>
              )}
              {(task.comments || []).map((c, i) => {
                const p = personById(c.user);
                return (
                  <div key={c._id || i} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <Avatar person={p} size={28} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <strong style={{ fontSize: 13 }}>{p.name}</strong>
                        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 3 }}>{c.body}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'flex-end' }}>
                <Avatar person="me" size={28} />
                <div style={{ flex: 1, border: '1px solid var(--line-2)', borderRadius: 10, padding: '8px 12px', background: 'var(--bg)' }}>
                  <textarea
                    className="tm-modal-notes-input"
                    placeholder="Add a comment — use @ to mention someone"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    rows={2}
                    style={{ marginTop: 0 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <button type="button" className="tm-btn tm-btn-primary tm-btn-sm" onClick={handleAddComment} disabled={!commentBody.trim()}>
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {tab === 'activity' && isEditing && (
            <div style={{ padding: '12px 18px' }}>
              {(task.activity || []).length === 0 && (
                <p style={{ color: 'var(--ink-4)', fontSize: 13 }}>No activity yet.</p>
              )}
              {[...(task.activity || [])].reverse().map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                  <Avatar person={a.user || 'me'} size={22} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{personById(a.user || 'me').name} </span>
                    <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{a.detail}</span>
                    {a.createdAt && (
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === 'details' && (
          <div className="tm-modal-footer">
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              <span className="tm-kbd">⌘</span> <span className="tm-kbd">↵</span> to save
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="tm-btn tm-btn-sm" onClick={onClose}>Cancel</button>
              <button type="submit" className="tm-btn tm-btn-primary tm-btn-sm" disabled={!title.trim() || saving}>
                {saving ? 'Saving…' : isEditing ? 'Save changes' : `Add to ${selectedQ?.label}`}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
