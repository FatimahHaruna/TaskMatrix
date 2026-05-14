import { useTaskContext } from '../../context/TaskContext';
import Quadrant, { QUADRANTS } from './Quadrant';

export default function QuadrantBoard({ onTaskClick, onAddTask, searchQuery }) {
  const { tasks } = useTaskContext();

  return (
    <div className="tm-matrix">
      {QUADRANTS.map((q) => (
        <Quadrant
          key={q.id}
          q={q}
          tasks={tasks.filter((t) => t.quadrant === q.id)}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}
