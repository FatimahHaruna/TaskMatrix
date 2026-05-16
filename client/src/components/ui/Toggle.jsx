export default function Toggle({ on = false, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange?.(!on)}
      style={{
        width: 38, height: 22, borderRadius: 999, padding: 3,
        background: on ? 'var(--ink)' : 'var(--line-2)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        transition: 'background 0.18s',
        flexShrink: 0,
      }}
    >
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}
