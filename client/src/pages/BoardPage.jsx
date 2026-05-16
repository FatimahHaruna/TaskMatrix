import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import QuadrantBoard from '../components/board/QuadrantBoard';
import TaskModal from '../components/tasks/TaskModal';
import Icon from '../components/ui/Icon';
import Toast, { useToast } from '../components/ui/Toast';
import { useTaskContext } from '../context/TaskContext';

const PRIORITIES = ['High', 'Medium', 'Low'];
const DUE_OPTIONS = ['Today', 'This week', 'Overdue'];
const ASSIGNEES = [
  { id: 'me', name: 'Me' },
  { id: 'maya', name: 'Maya' },
  { id: 'omar', name: 'Omar' },
  { id: 'iris', name: 'Iris' },
  { id: 'leo', name: 'Leo' },
  { id: 'noor', name: 'Noor' },
];

const EMPTY_FILTERS = { priority: '', label: '', assignee: '', due: '' };

function FilterPanel({ filters, onChange, onClose }) {
  const hasFilters = Object.values(filters).some(Boolean);
  return (
    <div className="tm-filter-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Filters</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {hasFilters && (
            <button className="tm-btn tm-btn-ghost tm-btn-sm" onClick={() => onChange(EMPTY_FILTERS)} style={{ fontSize: 11 }}>
              Clear all
            </button>
          )}
          <button className="tm-btn-icon" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
      </div>

      {/* Priority */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Priority</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRIORITIES.map((p) => {
            const active = filters.priority === p;
            const color = p === 'High' ? 'var(--q1)' : p === 'Medium' ? 'var(--q3)' : 'var(--q4)';
            return (
              <button key={p} onClick={() => onChange({ ...filters, priority: active ? '' : p })}
                style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${active ? color : 'var(--line-2)'}`,
                  background: active ? color : 'transparent', color: active ? '#fff' : 'var(--ink-2)',
                  fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Label */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Label</div>
        <input className="tm-input" placeholder="e.g. cs101, thesis" value={filters.label}
          onChange={(e) => onChange({ ...filters, label: e.target.value })}
          style={{ width: '100%', fontSize: 13 }} />
      </div>

      {/* Assignee */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Assignee</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ASSIGNEES.map((a) => (
            <button key={a.id} onClick={() => onChange({ ...filters, assignee: filters.assignee === a.id ? '' : a.id })}
              style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: filters.assignee === a.id ? 'var(--ink)' : 'transparent',
                color: filters.assignee === a.id ? 'var(--bg)' : 'var(--ink-2)',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500 }}>
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Due date */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Due date</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DUE_OPTIONS.map((d) => (
            <button key={d} onClick={() => onChange({ ...filters, due: filters.due === d ? '' : d })}
              style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: filters.due === d ? 'var(--ink)' : 'transparent',
                color: filters.due === d ? 'var(--bg)' : 'var(--ink-2)',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500 }}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getInsight(tasks) {
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
  const q1 = tasks.filter((t) => t.quadrant === 'q1' && !t.completed);
  if (overdue.length > 0) return `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''} need your attention now.`;
  if (q1.length > 0) return `${q1.length} urgent task${q1.length > 1 ? 's' : ''} need${q1.length === 1 ? 's' : ''} you today.`;
  return "You're on top of things. Keep it up!";
}

function getAiBanner(tasks) {
  const q3 = tasks.filter((t) => t.quadrant === 'q3' && !t.completed);
  const q4 = tasks.filter((t) => t.quadrant === 'q4' && !t.completed);
  if (q3.length >= 2) return `${q3.length} tasks in Delegate could be handed off to free up your day.`;
  if (q4.length >= 2) return `${q4.length} tasks in Eliminate may not be worth your time.`;
  return null;
}

export default function BoardPage() {
  const { tasks } = useTaskContext();
  const [modalState, setModalState] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [compact, setCompact] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const { msg, show: showToast } = useToast();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const insight = getInsight(tasks);
  const aiBanner = getAiBanner(tasks);
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="tm-app">
      <Sidebar />

      <div className="tm-board-content">
        <Topbar
          title="My Board"
          onSearch={setSearchQuery}
          actions={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="tm-btn tm-btn-sm" onClick={() => setCompact((v) => !v)} title={compact ? 'Detailed view' : 'Compact view'}>
                <Icon name={compact ? 'cards' : 'list'} size={13} />
                {compact ? 'Detailed' : 'Compact'}
              </button>
              <button className="tm-btn tm-btn-sm" onClick={() => setShowFilter((v) => !v)}
                style={{ background: hasActiveFilters ? 'var(--ink)' : undefined, color: hasActiveFilters ? 'var(--bg)' : undefined }}>
                <Icon name="filter" size={13} />
                Filter{hasActiveFilters ? ` (${Object.values(filters).filter(Boolean).length})` : ''}
              </button>
              <button className="tm-btn tm-btn-primary tm-btn-sm" onClick={() => setModalState({ defaultQuadrant: 'q1' })}>
                <Icon name="plus" size={13} />New task
              </button>
            </div>
          }
        />

        <div className="tm-board-scroll" style={{ paddingRight: showFilter ? 280 : undefined, transition: 'padding-right 0.2s' }}>
          <div className="tm-hero">
            <div>
              <div className="tm-hero-date">{today}</div>
              <h2 className="tm-hero-heading">{insight}</h2>
            </div>
            {aiBanner && (
              <div className="tm-ai-banner">
                <Icon name="sparkles" size={15} style={{ flexShrink: 0 }} />
                <div><strong>AI insight: </strong>{aiBanner}</div>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Filtering by:</span>
              {filters.priority && (
                <span className="tm-filter-chip" onClick={() => setFilters((f) => ({ ...f, priority: '' }))}>
                  Priority: {filters.priority} <Icon name="x" size={10} />
                </span>
              )}
              {filters.label && (
                <span className="tm-filter-chip" onClick={() => setFilters((f) => ({ ...f, label: '' }))}>
                  Label: {filters.label} <Icon name="x" size={10} />
                </span>
              )}
              {filters.assignee && (
                <span className="tm-filter-chip" onClick={() => setFilters((f) => ({ ...f, assignee: '' }))}>
                  Assignee: {ASSIGNEES.find((a) => a.id === filters.assignee)?.name} <Icon name="x" size={10} />
                </span>
              )}
              {filters.due && (
                <span className="tm-filter-chip" onClick={() => setFilters((f) => ({ ...f, due: '' }))}>
                  Due: {filters.due} <Icon name="x" size={10} />
                </span>
              )}
            </div>
          )}

          <QuadrantBoard
            onTaskClick={(task) => setModalState({ task })}
            onAddTask={(q) => setModalState({ defaultQuadrant: q })}
            searchQuery={searchQuery}
            filters={filters}
            compact={compact}
          />
        </div>
      </div>

      {showFilter && (
        <FilterPanel filters={filters} onChange={setFilters} onClose={() => setShowFilter(false)} />
      )}

      {modalState !== null && (
        <TaskModal
          task={modalState.task}
          defaultQuadrant={modalState.defaultQuadrant}
          onClose={() => setModalState(null)}
        />
      )}
      <Toast msg={msg} />
    </div>
  );
}
