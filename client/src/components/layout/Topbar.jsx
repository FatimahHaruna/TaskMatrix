import Icon from '../ui/Icon';

export default function Topbar({ title, actions, onSearch }) {
  return (
    <header className="tm-topbar">
      <h1>{title}</h1>

      <div className="tm-search">
        <Icon name="search" size={14} />
        <input
          placeholder="Search tasks, labels…"
          onChange={(e) => onSearch?.(e.target.value)}
          aria-label="Search tasks"
        />
        <span className="tm-kbd">⌘K</span>
      </div>

      <div style={{ flex: 1 }} />

      {actions}
    </header>
  );
}
