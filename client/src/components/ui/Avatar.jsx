export const PEOPLE = [
  { id: 'me',   name: 'Alex Park',    initials: 'AP', hue: 230 },
  { id: 'maya', name: 'Maya Singh',   initials: 'MS', hue: 12  },
  { id: 'omar', name: 'Omar Reyes',   initials: 'OR', hue: 152 },
  { id: 'iris', name: 'Iris Chen',    initials: 'IC', hue: 280 },
  { id: 'leo',  name: 'Leo Park',     initials: 'LP', hue: 42  },
  { id: 'noor', name: 'Noor Hassan',  initials: 'NH', hue: 195 },
];

export function personById(id) {
  return PEOPLE.find((p) => p.id === id) || PEOPLE[0];
}

export default function Avatar({ person, size = 24 }) {
  const p = typeof person === 'string' ? personById(person) : person;
  const isMe = p.id === 'me';
  const bg = isMe
    ? 'var(--ink)'
    : `hsl(${p.hue} 60% 88%)`;
  const color = isMe
    ? 'var(--bg)'
    : `hsl(${p.hue} 50% 30%)`;

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
