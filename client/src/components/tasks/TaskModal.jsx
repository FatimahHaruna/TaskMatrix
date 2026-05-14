import { useState, useEffect, useRef } from 'react';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import { QUADRANTS } from '../board/Quadrant';
import { useTaskContext } from '../../context/TaskContext';
import { suggestQuadrant } from '../../services/aiService';

const PRIORITIES = ['High', 'Medium', 'Low'];

const Q_COLORS = {
  q1: { color: 'var(--q1)', soft: 'var(--q1-soft)' },
  q2: { color: 'var(--q2)', soft: 'var(--q2-soft)' },
  q3: { color: 'var(--q3)', soft: 'var(--q3-soft)' },
  q4: { color: 'var(--q4)', soft: 'var(--q4-soft)' },
};

const CONFIDENCE_COLORS = { High: '#10b981', Medium: '#f59e0b', Low: '#6b7280' };

export default function TaskModal({ task, defaultQuadrant, onClose }) {
  const { createTask, updateTask } = useTaskContext();
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [quadrant, setQuadrant] = useState(task?.quadrant ?? defaultQuadrant ?? 'q1');
  const [priority, setPriority] = useState(task?.priority ?? 'Medium');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState(task?.labels ?? []);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showQuadrantPicker, setShowQuadrantPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const titleRef = useRef();
  const debounceRef = useRef();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Debounce AI suggestion when title changes (new task only)
  useEffect(() => {
    if (isEditing || title.trim().length < 10) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const suggestion = await suggestQuadrant(title, notes);
        setAiSuggestion(suggestion);
      } finally {
        setAiLoading(false);
      }
    }, 700);
    return () => clearTimeout(debounceRef.current);
  }, [title, notes, isEditing]);

  function applyAiSuggestion() {
    if (aiSuggestion) {
      setQuadrant(aiSuggestion.quadrant);
      setAiSuggestion(null);
    }
  }

  function addLabel(e) {
    if ((e.key === 'Enter' || e.key === ',') && labelInput.trim()) {
      e.preventDefault();
      const clean = labelInput.trim().replace(/^#/, '');
      if (!labels.includes(clean)) setLabels([...labels, clean]);
      setLabelInput('');
    }
  }

  function removeLabel(l) {
    setLabels(labels.filter((x) => x !== l));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const data = {
      title: title.trim(),
      notes,
      quadrant,
      priority,
      labels,
      dueDate: dueDate || null,
      aiSuggested: !!aiSuggestion,
    };
    try {
      if (isEditing) {
        await updateTask(task._id, data);
      } else {
        await createTask(data);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose();
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(e);
  }

  const selectedQ = QUADRANTS.find((q2) => q2.id === quadrant);
  const qColors = Q_COLORS[quadrant];

  return (
    <div className="tm-modal-overlay" onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
      <form className="tm-modal" onSubmit={handleSubmit}>
        {/* Header */}
        <div className="tm-modal-header">
          <span className="tm-modal-label">{isEditing ? 'Edit task' : 'New task'}</span>
          <button type="button" className="tm-btn-icon" onClick={onClose} aria-label="Close">
            <Icon name="x" size={15} />
          </button>
        </div>

        {/* Title */}
        <div className="tm-modal-body">
          <textarea
            ref={titleRef}
            className="tm-modal-title-input"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={2}
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <textarea
            className="tm-modal-notes-input"
            placeholder="Add notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* AI Suggestion */}
        {(aiLoading || aiSuggestion) && (
          <div className="tm-ai-suggest">
            <div className="tm-ai-icon">
              <Icon name="sparkles" size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              {aiLoading ? (
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Analysing task…</div>
              ) : (
                <>
                  <div className="tm-ai-suggest-heading">
                    <strong style={{ fontSize: 13.5 }}>AI suggests:</strong>
                    <span
                      className="tm-ai-quadrant-badge"
                      style={{ background: QUADRANTS.find((q2) => q2.id === aiSuggestion.quadrant)?.color }}
                    >
                      <span className="tm-tag-dot" style={{ background: 'white' }} />
                      {aiSuggestion.quadrantLabel} ({aiSuggestion.quadrant.toUpperCase()})
                    </span>
                    <span className="tm-ai-confidence">
                      <span className="tm-tag-dot" style={{ background: CONFIDENCE_COLORS[aiSuggestion.confidence] }} />
                      {aiSuggestion.confidence} confidence
                    </span>
                  </div>
                  <p className="tm-ai-reason">{aiSuggestion.reason}</p>
                  <div className="tm-ai-actions">
                    <button
                      type="button"
                      className="tm-btn tm-btn-primary tm-btn-sm"
                      onClick={applyAiSuggestion}
                    >
                      <Icon name="check" size={12} />
                      Apply suggestion
                    </button>
                    <button
                      type="button"
                      className="tm-btn tm-btn-sm"
                      onClick={() => { setShowQuadrantPicker(true); setAiSuggestion(null); }}
                    >
                      Pick different quadrant
                    </button>
                    <button
                      type="button"
                      className="tm-btn tm-btn-ghost tm-btn-sm"
                      onClick={() => setAiSuggestion(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quadrant picker */}
        {showQuadrantPicker && (
          <div style={{ padding: '0 14px 12px' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8, fontWeight: 500 }}>
              Select quadrant
            </div>
            <div className="tm-quad-select-grid">
              {QUADRANTS.map((q2) => (
                <button
                  key={q2.id}
                  type="button"
                  className={`tm-quad-select-item${quadrant === q2.id ? ' is-selected' : ''}`}
                  style={{ '--q-color': Q_COLORS[q2.id].color, '--q-soft': Q_COLORS[q2.id].soft }}
                  onClick={() => { setQuadrant(q2.id); setShowQuadrantPicker(false); }}
                >
                  <span
                    className="tm-tag-dot"
                    style={{ width: 8, height: 8, background: Q_COLORS[q2.id].color }}
                  />
                  {q2.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meta row */}
        <div className="tm-modal-meta">
          {/* Current quadrant chip */}
          <button
            type="button"
            className="tm-btn tm-btn-sm"
            style={{
              background: qColors.soft,
              borderColor: 'transparent',
              color: selectedQ ? Q_COLORS[quadrant].color : 'var(--ink)',
            }}
            onClick={() => setShowQuadrantPicker((v) => !v)}
          >
            <span className="tm-tag-dot" style={{ background: qColors.color }} />
            {selectedQ?.label}
          </button>

          {/* Due date */}
          <label className="tm-btn tm-btn-sm" style={{ cursor: 'pointer', position: 'relative' }}>
            <Icon name="calendar" size={13} />
            {dueDate ? new Date(dueDate + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Due date'}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', inset: 0, cursor: 'pointer' }}
            />
          </label>

          {/* Priority */}
          <select
            className="tm-btn tm-btn-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ cursor: 'pointer', appearance: 'none', paddingRight: 8 }}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p} priority</option>
            ))}
          </select>

          {/* Labels */}
          {labels.map((l) => (
            <button
              key={l}
              type="button"
              className="tm-chip"
              onClick={() => removeLabel(l)}
              title="Remove label"
            >
              #{l} <Icon name="x" size={10} />
            </button>
          ))}
          <input
            className="tm-btn tm-btn-sm tm-btn-ghost"
            placeholder="+ label"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={addLabel}
            style={{ minWidth: 60, width: 'auto', cursor: 'text' }}
          />
        </div>

        {/* Footer */}
        <div className="tm-modal-footer">
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            <span className="tm-kbd">⌘</span> <span className="tm-kbd">↵</span> to save
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="tm-btn tm-btn-sm" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="tm-btn tm-btn-primary tm-btn-sm"
              disabled={!title.trim() || saving}
            >
              {saving ? 'Saving…' : isEditing ? 'Save changes' : `Add to ${selectedQ?.label}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
