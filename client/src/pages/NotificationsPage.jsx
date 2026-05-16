import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/ui/Icon';
import Avatar, { PEOPLE } from '../components/ui/Avatar';
import { useTaskContext } from '../context/TaskContext';

export default function NotificationsPage() {
  const { tasks } = useTaskContext();
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
  const dueSoon = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const diff = (new Date(t.dueDate) - new Date()) / 3600000;
    return diff >= 0 && diff <= 24;
  });

  const notifications = [
    ...overdue.map((t) => ({ type: 'overdue', task: t, time: 'Now', icon: 'clock', color: 'var(--q1)' })),
    ...dueSoon.map((t) => ({ type: 'due-soon', task: t, time: 'Within 24h', icon: 'bell', color: 'var(--q3)' })),
    { type: 'comment', title: 'Maya commented on "Fix data-pipeline bug"', body: 'Confirmed the bug — parser breaks on tab-separated input.', who: 'maya', time: '34m ago', icon: 'message', color: 'var(--q2)' },
    { type: 'assign', title: 'Omar was assigned to "Coordinate shared notes"', who: 'omar', time: '1h ago', icon: 'users', color: 'var(--q4)' },
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
                    {n.task ? (
                      n.type === 'overdue'
                        ? <><span style={{ color: 'var(--q1)', fontWeight: 700 }}>Overdue:</span> {n.task.title}</>
                        : <><span style={{ color: 'var(--q3)', fontWeight: 700 }}>Due soon:</span> {n.task.title}</>
                    ) : n.title}
                  </div>
                  {n.body && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>{n.body}</div>}
                  <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {n.who && <Avatar person={n.who} size={16} />}
                    {n.time}
                  </div>
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

          {/* Notification settings preview */}
          <div style={{ marginTop: 32, maxWidth: 680 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Notification preferences</h3>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 18 }}>
              {[
                { label: 'In-app notifications', desc: 'Show in the notification list', on: true },
                { label: 'Due date reminders', desc: 'Alert 24h before due date', on: true },
                { label: 'Email notifications', desc: 'Send digest emails (mocked)', on: false },
                { label: 'Task assignment alerts', desc: 'Notify when tasks are assigned to you', on: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{row.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{row.desc}</div>
                  </div>
                  <div style={{ width: 38, height: 22, borderRadius: 999, padding: 3, background: row.on ? 'var(--ink)' : 'var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: row.on ? 'flex-end' : 'flex-start' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
