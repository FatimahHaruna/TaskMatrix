import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import Brand from '../ui/Brand';
import Avatar from '../ui/Avatar';
import { useTaskContext } from '../../context/TaskContext';

const WORKSPACES = [
  { id: 'spring',   label: "Spring '26 semester", color: 'var(--q2)' },
  { id: 'personal', label: 'Personal',             color: 'var(--q3)' },
  { id: 'thesis',   label: 'Senior thesis',        color: 'var(--q1)' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { tasks } = useTaskContext();

  const totalTasks = tasks.filter((t) => !t.completed).length;

  const items = [
    { id: '/board',     label: 'My Board',  icon: 'grid',      count: totalTasks },
    { id: '/analytics', label: 'Analytics', icon: 'analytics'                    },
  ];

  return (
    <aside className="tm-sidebar">
      <Brand />

      {items.map((item) => {
        const active = pathname === item.id || (item.id !== '/' && pathname.startsWith(item.id));
        return (
          <a
            key={item.id}
            className={`tm-nav-item${active ? ' is-active' : ''}`}
            onClick={() => navigate(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(item.id)}
          >
            <Icon name={item.icon} size={15} />
            <span>{item.label}</span>
            {item.count != null && (
              <span className="tm-nav-count">{item.count}</span>
            )}
          </a>
        );
      })}

      <div className="tm-side-section-label">Workspaces</div>

      {WORKSPACES.map((w) => (
        <a key={w.id} className="tm-nav-item" role="button" tabIndex={0}>
          <span className="tm-tag-dot" style={{ background: w.color, width: 8, height: 8 }} />
          <span>{w.label}</span>
        </a>
      ))}

      <div className="tm-sidebar-spacer" />

      <div className="tm-nav-item" style={{ cursor: 'default', paddingTop: 10 }}>
        <Avatar person="me" size={28} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Alex Park</span>
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Student plan</span>
        </div>
      </div>
    </aside>
  );
}
