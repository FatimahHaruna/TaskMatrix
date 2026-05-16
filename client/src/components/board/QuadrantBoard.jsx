import { DragDropContext } from '@hello-pangea/dnd';
import { useTaskContext } from '../../context/TaskContext';
import Quadrant, { QUADRANTS } from './Quadrant';

export default function QuadrantBoard({ onTaskClick, onAddTask, searchQuery, compact }) {
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
        {QUADRANTS.map((q) => (
          <Quadrant
            key={q.id}
            q={q}
            tasks={tasks.filter((t) => t.quadrant === q.id && !t.completed)}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
            searchQuery={searchQuery}
            compact={compact}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
