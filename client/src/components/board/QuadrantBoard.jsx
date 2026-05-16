import { DragDropContext } from '@hello-pangea/dnd';
import { useTaskContext } from '../../context/TaskContext';
import Quadrant, { QUADRANTS } from './Quadrant';

function applyFiltersAndSearch(tasks, searchQuery, filters) {
  let result = tasks.filter((t) => !t.completed);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      (t.notes || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      t.labels?.some((l) => l.toLowerCase().includes(q))
    );
  }

  if (filters?.priority) {
    result = result.filter((t) => t.priority === filters.priority);
  }

  if (filters?.label) {
    const l = filters.label.toLowerCase();
    result = result.filter((t) => t.labels?.some((label) => label.toLowerCase().includes(l)));
  }

  if (filters?.assignee) {
    result = result.filter((t) => t.assignee === filters.assignee);
  }

  if (filters?.due === 'Overdue') {
    const now = new Date();
    result = result.filter((t) => t.dueDate && new Date(t.dueDate) < now);
  } else if (filters?.due === 'Today') {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    result = result.filter((t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow);
  } else if (filters?.due === 'This week') {
    const now = new Date();
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);
    result = result.filter((t) => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= weekEnd);
  }

  return result;
}

export default function QuadrantBoard({ onTaskClick, onAddTask, searchQuery, filters, compact }) {
  const { tasks, moveTask } = useTaskContext();

  function onDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    moveTask(draggableId, destination.droppableId, destination.index);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="tm-matrix">
        {QUADRANTS.map((q) => {
          const quadrantTasks = tasks.filter((t) => t.quadrant === q.id);
          const filtered = applyFiltersAndSearch(quadrantTasks, searchQuery, filters);
          return (
            <Quadrant
              key={q.id}
              q={q}
              tasks={filtered}
              allTasks={quadrantTasks.filter((t) => !t.completed)}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              compact={compact}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
