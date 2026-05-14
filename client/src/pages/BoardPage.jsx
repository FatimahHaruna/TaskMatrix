import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import QuadrantBoard from '../components/board/QuadrantBoard';
import TaskModal from '../components/tasks/TaskModal';
import Icon from '../components/ui/Icon';
import Toast, { useToast } from '../components/ui/Toast';
import { useTaskContext } from '../context/TaskContext';

function getInsight(tasks) {
  const q1 = tasks.filter((t) => t.quadrant === 'q1' && !t.completed);
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed);
  if (overdue.length > 0) return `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''} need your attention now.`;
  if (q1.length > 0) return `${q1.length} urgent task${q1.length > 1 ? 's' : ''} need${q1.length === 1 ? 's' : ''} you today.`;
  return "You’re on top of things. Keep it up!";
}

function getAiBanner(tasks) {
  const q3 = tasks.filter((t) => t.quadrant === 'q3' && !t.completed);
  if (q3.length >= 2) return `${q3.length} tasks in Delegate could be handed off to free up your day.`;
  const q4 = tasks.filter((t) => t.quadrant === 'q4' && !t.completed);
  if (q4.length >= 2) return `${q4.length} tasks in Eliminate may not be worth your time.`;
  return null;
}

export default function BoardPage() {
  const { tasks } = useTaskContext();
  const [modalState, setModalState] = useState(null); // null | { task?, defaultQuadrant? }
  const [searchQuery, setSearchQuery] = useState('');
  const { msg, show: showToast } = useToast();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const insight = getInsight(tasks);
  const aiBanner = getAiBanner(tasks);

  function openNewTask(defaultQuadrant) {
    setModalState({ defaultQuadrant });
  }

  function openEditTask(task) {
    setModalState({ task });
  }

  function closeModal() {
    setModalState(null);
  }

  return (
    <div className="tm-app">
      <Sidebar />

      <div className="tm-board-content">
        <Topbar
          title="My Board"
          onSearch={setSearchQuery}
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="tm-btn tm-btn-sm">
                <Icon name="filter" size={13} />Filter
              </button>
              <button
                className="tm-btn tm-btn-primary tm-btn-sm"
                onClick={() => openNewTask('q1')}
              >
                <Icon name="plus" size={13} />New task
              </button>
            </div>
          }
        />

        <div className="tm-board-scroll">
          {/* Hero strip */}
          <div className="tm-hero">
            <div>
              <div className="tm-hero-date">{today}</div>
              <h2 className="tm-hero-heading">{insight}</h2>
            </div>

            {aiBanner && (
              <div className="tm-ai-banner">
                <Icon name="sparkles" size={15} style={{ flexShrink: 0 }} />
                <div>
                  <strong>AI insight: </strong>{aiBanner}
                </div>
              </div>
            )}
          </div>

          {/* 2×2 Matrix */}
          <QuadrantBoard
            onTaskClick={openEditTask}
            onAddTask={openNewTask}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Task modal */}
      {modalState !== null && (
        <TaskModal
          task={modalState.task}
          defaultQuadrant={modalState.defaultQuadrant}
          onClose={closeModal}
        />
      )}

      <Toast msg={msg} />
    </div>
  );
}
