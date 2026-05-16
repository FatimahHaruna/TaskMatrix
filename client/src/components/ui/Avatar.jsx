export const PEOPLE = [
  { id: 'maya', name: 'Maya Singh',   initials: 'MS', hue: 12  },
  { id: 'omar', name: 'Omar Reyes',   initials: 'OR', hue: 152 },
  { id: 'iris', name: 'Iris Chen',    initials: 'IC', hue: 280 },
  { id: 'leo',  name: 'Leo Park',     initials: 'LP', hue: 42  },
  { id: 'noor', name: 'Noor Hassan',  initials: 'NH', hue: 195 },
];

export function personById(id) {
  return PEOPLE.find((p) => p.id === id) || { id, name: id, initials: id ? id.slice(0, 2).toUpperCase() : '??', hue: 230 };
}

export function initials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function Avatar({ person, size = 24 }) {
  const p = typeof person === 'string' ? personById(person) : person;
  const isOwner = p.isOwner;
  const bg = isOwner ? 'var(--ink)' : `hsl(${p.hue ?? 230} 60% 88%)`;
  const color = isOwner ? 'var(--bg)' : `hsl(${p.hue ?? 230} 50% 30%)`;

  return (
    <div
      className="tm-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: bg, color }}
      title={p.name}
    >
      {p.initials}
    </div>
  );
}

export function AvatarStack({ ids = [], size = 22 }) {
  return (
    <div className="tm-avatar-stack">
      {ids.map((id) => <Avatar key={id} person={id} size={size} />)}
    </div>
  );
}
