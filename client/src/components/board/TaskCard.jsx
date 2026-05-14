import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import { useTaskContext } from '../../context/TaskContext';

function formatDue(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d - now;
  const days = Math.floor(diff / 86400000);
  if (days < 0) return { label: `Overdue · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, overdue: true };
  if (days === 0) return { label: 'Due today', overdue: false };
  if (days === 1) return { label: 'Due tomorrow', overdue: false };
  if (days < 7) return { label: `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`, overdue: false };
  return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: false };
}

export default function TaskCard({ task, onClick }) {
  const { toggleComplete, deleteTask } = useTaskContext();
  const due = task.dueDate ? formatDue(task.dueDate) : null;

  function handleCheck(e) {
    e.stopPropagation();
    toggleComplete(task._id);
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (confirm('Delete this task?')) deleteTask(task._id);
  }

  return (
    <div
      className={`tm-task${task.completed ? ' is-completed' : ''}`}
      onClick={() => onClick?.(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(task)}
    >
      <div className="tm-task-top">
        <button
          className={`tm-task-checkbox${task.completed ? ' is-checked' : ''}`}
          onClick={handleCheck}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          style={{ border: '1.5px solid var(--ink-4)' }}
        >
          {task.completed && <Icon name="check" size={9} stroke={2.5} />}
        </button>
        <div className="tm-task-title">{task.title}</div>
        <button
          className="tm-btn-icon tm-task-menu-btn"
          onClick={handleDelete}
          aria-label="Delete task"
          style={{ marginTop: -2 }}
        >
          <Icon name="trash" size={13} />
        </button>
      </div>

      <div className="tm-task-meta">
        {due && (
          <span className={`tm-task-due${due.overdue ? ' is-overdue' : ''}`}>
            <Icon name="clock" size={11} />
            {due.label}
          </span>
        )}

        {due && task.priority && task.priority !== 'Low' && (
          <span className="sep">·</span>
        )}

        {task.priority && task.priority !== 'Low' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <span
              className="tm-tag-dot"
              style={{ background: task.priority === 'High' ? 'var(--q1)' : 'var(--q3)' }}
            />
            {task.priority}
          </span>
        )}

        {task.labels?.length > 0 && (
          <>
            <span className="sep">·</span>
            <span style={{ color: 'var(--ink-3)' }}>#{task.labels[0]}</span>
          </>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <Avatar person={task.assignee || 'me'} size={18} />
        </div>
      </div>
    </div>
  );
}
