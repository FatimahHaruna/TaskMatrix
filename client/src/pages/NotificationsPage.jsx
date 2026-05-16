import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/ui/Icon';
import Avatar from '../components/ui/Avatar';
import { useTaskContext } from '../context/TaskContext';

export default function NotificationsPage() {
  const { tasks } = useTaskContext();
  const navigate = useNavigate();
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
  const dueSoon = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const diff = (new Date(t.dueDate) - new Date()) / 3600000;
    return diff >= 0 && diff <= 24;
  });

  const notifications = [
    ...overdue.map((t) => ({ type: 'overdue', task: t, time: 'Now', icon: 'clock', color: 'var(--q1)' })),
    ...dueSoon.map((t) => ({ type: 'due-soon', task: t, time: 'Within 24h', icon: 'bell', color: 'var(--q3)' })),
  ];

  return (
    <div className="tm-app">
      <Sidebar />
      <div className="tm-board-content">
        <Topbar title="Notifications" />
        <div className="tm-board-scroll" style={{ background: 'var(--bg)' }}>
          <div style={{ marginBottom: 20 }}>
            <div className="tm-hero-date">Inbox</div>
            <h2 className="tm-hero-heading">
              {notifications.length > 0 ? `${notifications.length} notification${notifications.length > 1 ? 's' : ''}` : "You're all caught up"}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 680 }}>
            {notifications.map((n, i) => (
              <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: n.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.9 }}>
                  <Icon name={n.icon} size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13.5, color: 'var(--ink)' }}>
                    {n.type === 'overdue'
                      ? <><span style={{ color: 'var(--q1)', fontWeight: 700 }}>Overdue:</span> {n.task.title}</>
                      : <><span style={{ color: 'var(--q3)', fontWeight: 700 }}>Due soon:</span> {n.task.title}</>
                    }
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 6 }}>{n.time}</div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div style={{ color: 'var(--ink-4)', fontSize: 14, textAlign: 'center', padding: '60px 0' }}>
                <Icon name="bell" size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
                <div>No notifications right now.</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 32, maxWidth: 680 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>
              Manage notification preferences in{' '}
              <a style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/settings')}>
                Settings → Notifications
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
