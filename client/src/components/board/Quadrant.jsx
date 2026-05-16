import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Icon from '../ui/Icon';
import TaskCard from './TaskCard';

export const QUADRANTS = [
  { id: 'q1', num: '01', label: 'Do First',  subtitle: 'Urgent · Important',         color: 'var(--q1)', soft: 'var(--q1-soft)' },
  { id: 'q2', num: '02', label: 'Schedule',  subtitle: 'Not urgent · Important',     color: 'var(--q2)', soft: 'var(--q2-soft)' },
  { id: 'q3', num: '03', label: 'Delegate',  subtitle: 'Urgent · Not important',     color: 'var(--q3)', soft: 'var(--q3-soft)' },
  { id: 'q4', num: '04', label: 'Eliminate', subtitle: 'Not urgent · Not important', color: 'var(--q4)', soft: 'var(--q4-soft)' },
];

export default function Quadrant({ q, tasks, onTaskClick, onAddTask, searchQuery, compact }) {
  const [collapsed, setCollapsed] = useState(false);

  const filtered = searchQuery
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.labels?.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tasks;

  const overdueCount = filtered.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  return (
    <div className="tm-quad">
      <div className="tm-quad-header" style={{ background: q.color }}>
        <span className="tm-quad-num">{q.num}</span>
        <div style={{ flex: 1 }}>
          <div className="tm-quad-title">{q.label}</div>
          <div className="tm-quad-sub">{q.subtitle}</div>
        </div>
        <span className="tm-quad-count">{filtered.length}</span>
        {overdueCount > 0 && (
          <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>
            {overdueCount} overdue
          </span>
        )}
        <button
          className="tm-btn-icon"
          onClick={() => onAddTask(q.id)}
          aria-label={`Add task to ${q.label}`}
          style={{ color: 'white', background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 5 }}
        >
          <Icon name="plus" size={14} />
        </button>
        <button
          className="tm-btn-icon"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 5 }}
        >
          <Icon name={collapsed ? 'chevronDown' : 'chevronUp'} size={14} />
        </button>
      </div>

      {!collapsed && (
        <Droppable droppableId={q.id}>
          {(provided, snapshot) => (
            <div
              className="tm-quad-body"
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ background: snapshot.isDraggingOver ? q.soft : undefined, transition: 'background 0.15s' }}
            >
              {filtered.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      style={{ ...prov.draggableProps.style, opacity: snap.isDragging ? 0.85 : 1 }}
                    >
                      <TaskCard task={task} onClick={onTaskClick} compact={compact} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <button className="tm-quad-add" onClick={() => onAddTask(q.id)}>
                <Icon name="plus" size={12} />Add task
              </button>
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}
