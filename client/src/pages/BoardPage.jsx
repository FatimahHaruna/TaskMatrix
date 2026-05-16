import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import QuadrantBoard from '../components/board/QuadrantBoard';
import TaskModal from '../components/tasks/TaskModal';
import Icon from '../components/ui/Icon';
import Toast, { useToast } from '../components/ui/Toast';
import { useTaskContext } from '../context/TaskContext';

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
  const { msg, show: showToast } = useToast();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const insight = getInsight(tasks);
  const aiBanner = getAiBanner(tasks);

  return (
    <div className="tm-app">
      <Sidebar />

      <div className="tm-board-content">
        <Topbar
          title="My Board"
          onSearch={setSearchQuery}
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="tm-btn tm-btn-sm" onClick={() => setCompact((v) => !v)} title={compact ? 'Detailed view' : 'Compact view'}>
                <Icon name={compact ? 'cards' : 'list'} size={13} />
                {compact ? 'Detailed' : 'Compact'}
              </button>
              <button className="tm-btn tm-btn-sm">
                <Icon name="filter" size={13} />Filter
              </button>
              <button className="tm-btn tm-btn-primary tm-btn-sm" onClick={() => setModalState({ defaultQuadrant: 'q1' })}>
                <Icon name="plus" size={13} />New task
              </button>
            </div>
          }
        />

        <div className="tm-board-scroll">
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

          <QuadrantBoard
            onTaskClick={(task) => setModalState({ task })}
            onAddTask={(q) => setModalState({ defaultQuadrant: q })}
            searchQuery={searchQuery}
            compact={compact}
          />
        </div>
      </div>

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
