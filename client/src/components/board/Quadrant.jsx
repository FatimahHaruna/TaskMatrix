import Icon from '../ui/Icon';
import TaskCard from './TaskCard';

export const QUADRANTS = [
  { id: 'q1', num: '01', label: 'Do First',  subtitle: 'Urgent · Important',         color: 'var(--q1)', soft: 'var(--q1-soft)' },
  { id: 'q2', num: '02', label: 'Schedule',  subtitle: 'Not urgent · Important',     color: 'var(--q2)', soft: 'var(--q2-soft)' },
  { id: 'q3', num: '03', label: 'Delegate',  subtitle: 'Urgent · Not important',     color: 'var(--q3)', soft: 'var(--q3-soft)' },
  { id: 'q4', num: '04', label: 'Eliminate', subtitle: 'Not urgent · Not important', color: 'var(--q4)', soft: 'var(--q4-soft)' },
];

export default function Quadrant({ q, tasks, onTaskClick, onAddTask, searchQuery }) {
  const filtered = searchQuery
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.labels?.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tasks;

  return (
    <div className="tm-quad">
      <div className="tm-quad-header" style={{ background: q.color }}>
        <span className="tm-quad-num">{q.num}</span>
        <div style={{ flex: 1 }}>
          <div className="tm-quad-title">{q.label}</div>
          <div className="tm-quad-sub">{q.subtitle}</div>
        </div>
        <span className="tm-quad-count">{filtered.length}</span>
        <button
          className="tm-btn-icon"
          onClick={() => onAddTask(q.id)}
          aria-label={`Add task to ${q.label}`}
          style={{ color: 'white', background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '5px' }}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>

      <div className="tm-quad-body">
        {filtered.map((task) => (
          <TaskCard key={task._id} task={task} onClick={onTaskClick} />
        ))}

        <button
          className="tm-quad-add"
          onClick={() => onAddTask(q.id)}
        >
          <Icon name="plus" size={12} />
          Add task
        </button>
      </div>
    </div>
  );
}
