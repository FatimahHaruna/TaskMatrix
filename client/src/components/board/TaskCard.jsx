import Icon from '../ui/Icon';
import Avatar, { initials } from '../ui/Avatar';
import { useTaskContext } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export function formatDue(dateStr, timeStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d); target.setHours(0, 0, 0, 0);
  const diff = Math.floor((target - now) / 86400000);
  const timeLabel = timeStr ? ` · ${timeStr}` : '';
  let label, overdue;
  if (diff < 0) { label = `Overdue · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${timeLabel}`; overdue = true; }
  else if (diff === 0) { label = `Today${timeLabel}`; overdue = false; }
  else if (diff === 1) { label = `Tomorrow${timeLabel}`; overdue = false; }
  else if (diff < 7) { label = `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${timeLabel}`; overdue = false; }
  else { label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + timeLabel; overdue = false; }
  return { label, overdue };
}

export default function TaskCard({ task, onClick, compact = false }) {
  const { toggleComplete, deleteTask } = useTaskContext();
  const { user } = useAuth();
  const due = task.dueDate ? formatDue(task.dueDate, task.dueTime) : null;
  const ownerInitials = user ? (user.avatarInitials || initials(user.displayName)) : '?';
  const ownerName = user?.displayName || 'Me';

  function handleCheck(e) {
    e.stopPropagation();
    toggleComplete(task._id);
  }
  function handleDelete(e) {
    e.stopPropagation();
    deleteTask(task._id);
  }

  if (compact) {
    return (
      <div
        className={`tm-task tm-task--compact${task.completed ? ' is-completed' : ''}`}
        onClick={() => onClick?.(task)}
        role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.(task)}
        style={{ padding: '7px 10px', gap: 6 }}
      >
        <div className="tm-task-top" style={{ gap: 6 }}>
          <button className={`tm-task-checkbox${task.completed ? ' is-checked' : ''}`} onClick={handleCheck} aria-label="Toggle complete">
            {task.completed && <Icon name="check" size={8} stroke={2.5} />}
          </button>
          <div className="tm-task-title" style={{ fontSize: 12.5 }}>{task.title}</div>
          {due?.overdue && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--q1)', flexShrink: 0 }} title="Overdue" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`tm-task${task.completed ? ' is-completed' : ''}`}
      onClick={() => onClick?.(task)}
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(task)}
    >
      {due?.overdue && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--q1)', borderRadius: '10px 10px 0 0' }} />
      )}
      <div className="tm-task-top">
        <button className={`tm-task-checkbox${task.completed ? ' is-checked' : ''}`} onClick={handleCheck} aria-label="Toggle complete">
          {task.completed && <Icon name="check" size={9} stroke={2.5} />}
        </button>
        <div className="tm-task-title">{task.title}</div>
        <button className="tm-btn-icon tm-task-menu-btn" onClick={handleDelete} aria-label="Move to trash" style={{ marginTop: -2 }}>
          <Icon name="trash" size={13} />
        </button>
      </div>

      <div className="tm-task-meta">
        {due && (
          <span className={`tm-task-due${due.overdue ? ' is-overdue' : ''}`}>
            <Icon name="clock" size={11} />{due.label}
          </span>
        )}
        {task.priority && task.priority !== 'Low' && (
          <>
            {due && <span className="sep">·</span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <span className="tm-tag-dot" style={{ background: task.priority === 'High' ? 'var(--q1)' : 'var(--q3)' }} />
              {task.priority}
            </span>
          </>
        )}
        {task.labels?.length > 0 && (
          <>
            <span className="sep">·</span>
            <span style={{ color: 'var(--ink-3)' }}>#{task.labels[0]}</span>
          </>
        )}
        {task.comments?.length > 0 && (
          <>
            <span className="sep">·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--ink-4)' }}>
              <Icon name="message" size={11} />{task.comments.length}
            </span>
          </>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <Avatar person={{ id: 'owner', name: ownerName, initials: ownerInitials, hue: 230, isOwner: true }} size={18} />
        </div>
      </div>
    </div>
  );
}
