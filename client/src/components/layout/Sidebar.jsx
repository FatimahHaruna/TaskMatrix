import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import Brand from '../ui/Brand';
import Avatar from '../ui/Avatar';
import { useTaskContext } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

const WORKSPACES = [
  { id: 'spring',   label: "Spring '26 semester", color: 'var(--q2)' },
  { id: 'personal', label: 'Personal',             color: 'var(--q3)' },
  { id: 'thesis',   label: 'Senior thesis',        color: 'var(--q1)' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { tasks, trash } = useTaskContext();
  const { user, logout } = useAuth();

  const overdueCount = tasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  const activeCount = tasks.filter((t) => !t.completed).length;

  const items = [
    { id: '/board',         label: 'My Board',      icon: 'grid',      count: activeCount,  alert: overdueCount > 0 },
    { id: '/analytics',     label: 'Analytics',     icon: 'analytics'                      },
    { id: '/team',          label: 'Team',          icon: 'users'                          },
    { id: '/notifications', label: 'Notifications', icon: 'bell',      count: overdueCount, alert: overdueCount > 0 },
  ];

  const bottomItems = [
    { id: '/trash',        label: 'Trash',        icon: 'trash',  count: trash.length || null },
    { id: '/integrations', label: 'Integrations', icon: 'link'  },
    { id: '/settings',     label: 'Settings',     icon: 'cog'   },
  ];

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const NavItem = ({ item }) => (
    <a
      className={`tm-nav-item${isActive(item.id) ? ' is-active' : ''}`}
      onClick={() => navigate(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(item.id)}
    >
      <Icon name={item.icon} size={15} />
      <span>{item.label}</span>
      {item.count != null && item.count > 0 && (
        <span className="tm-nav-count" style={item.alert && !isActive(item.id) ? { color: 'var(--q1)', fontWeight: 700 } : {}}>
          {item.count}
        </span>
      )}
    </a>
  );

  return (
    <aside className="tm-sidebar">
      <Brand />

      {items.map((item) => <NavItem key={item.id} item={item} />)}

      <div className="tm-side-section-label">Workspaces</div>
      {WORKSPACES.map((w) => (
        <a key={w.id} className="tm-nav-item" role="button" tabIndex={0}>
          <span className="tm-tag-dot" style={{ background: w.color, width: 8, height: 8 }} />
          <span>{w.label}</span>
        </a>
      ))}

      <div className="tm-sidebar-spacer" />

      {bottomItems.map((item) => <NavItem key={item.id} item={item} />)}

      <div className="tm-nav-item" style={{ cursor: 'default', paddingTop: 10, marginTop: 4, borderTop: '1px solid var(--line)' }}>
        <Avatar person={{ id: 'me', initials: user ? (user.avatarInitials || user.displayName?.slice(0,2).toUpperCase() || 'ME') : 'ME', hue: 230 }} size={28} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.displayName || 'Alex Park'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Student plan</span>
        </div>
        {user && (
          <button className="tm-btn-icon" onClick={logout} title="Sign out" style={{ flexShrink: 0 }}>
            <Icon name="arrow" size={13} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>
    </aside>
  );
}
