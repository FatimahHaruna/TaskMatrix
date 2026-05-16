import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/ui/Icon';
import { useTaskContext } from '../context/TaskContext';

export default function TrashPage() {
  const { trash, restoreTask, permanentDelete } = useTaskContext();

  return (
    <div className="tm-app">
      <Sidebar />
      <div className="tm-board-content">
        <Topbar title="Trash" />
        <div className="tm-board-scroll" style={{ background: 'var(--bg)' }}>
          <div style={{ marginBottom: 20 }}>
            <div className="tm-hero-date">Deleted tasks</div>
            <h2 className="tm-hero-heading">
              {trash.length > 0 ? `${trash.length} task${trash.length > 1 ? 's' : ''} in trash` : 'Trash is empty'}
            </h2>
          </div>

          {trash.length === 0 && (
            <div style={{ color: 'var(--ink-4)', fontSize: 14, textAlign: 'center', padding: '60px 0' }}>
              <Icon name="trash" size={36} style={{ opacity: 0.25, marginBottom: 12 }} />
              <div>No deleted tasks.</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 720 }}>
            {trash.map((task) => (
              <div key={task._id} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink-3)', textDecoration: 'line-through' }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>
                    Deleted {task.deletedAt ? new Date(task.deletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                    {task.quadrant && ` · was in ${({ q1: 'Do First', q2: 'Schedule', q3: 'Delegate', q4: 'Eliminate' })[task.quadrant]}`}
                  </div>
                </div>
                <button className="tm-btn tm-btn-sm" onClick={() => restoreTask(task._id)}>
                  <Icon name="restore" size={13} />Restore
                </button>
                <button className="tm-btn tm-btn-sm tm-btn-danger" onClick={() => { if (confirm('Permanently delete this task?')) permanentDelete(task._id); }}>
                  <Icon name="x" size={13} />Delete forever
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
