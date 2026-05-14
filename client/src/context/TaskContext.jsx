import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskApi } from '../services/api';

const TaskContext = createContext(null);

// Sample seed data so the app works without MongoDB on first load.
const SEED_TASKS = [
  { _id: 's1', title: 'Finish CS101 lab report — due tonight 11:59pm', quadrant: 'q1', priority: 'High', labels: ['cs101', 'lab'], dueDate: new Date().toISOString(), completed: false, assignee: 'me' },
  { _id: 's2', title: 'Email Prof. Nguyen about midterm absence', quadrant: 'q1', priority: 'High', labels: ['email'], completed: false, assignee: 'me' },
  { _id: 's3', title: 'Study for Linear Algebra midterm · Ch. 5–8', quadrant: 'q2', priority: 'Medium', labels: ['math240', 'study'], completed: false, assignee: 'me' },
  { _id: 's4', title: 'Draft thesis proposal before advisor meeting', quadrant: 'q2', priority: 'Medium', labels: ['thesis'], completed: false, assignee: 'me' },
  { _id: 's5', title: 'Apply for Stripe summer internship', quadrant: 'q2', priority: 'Medium', labels: ['career'], completed: false, assignee: 'me' },
  { _id: 's6', title: 'Pick up textbook holds at library', quadrant: 'q3', priority: 'Low', labels: ['errand'], completed: false, assignee: 'leo' },
  { _id: 's7', title: 'Coordinate shared notes doc for study group', quadrant: 'q3', priority: 'Low', labels: ['math240'], completed: false, assignee: 'omar' },
  { _id: 's8', title: 'Reorganize Discord study servers', quadrant: 'q4', priority: 'Low', labels: ['ops'], completed: false, assignee: 'me' },
  { _id: 's9', title: 'Watch optional bonus lecture replay', quadrant: 'q4', priority: 'Low', labels: ['cs101'], completed: false, assignee: 'me' },
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingApi, setUsingApi] = useState(false);

  // Try to load from API; fall back to seed data silently.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    taskApi.getAll()
      .then((data) => {
        if (cancelled) return;
        if (data.length > 0) {
          setTasks(data);
          setUsingApi(true);
        }
      })
      .catch(() => {
        // Server not available — seed data stays loaded.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const createTask = useCallback(async (data) => {
    if (usingApi) {
      const task = await taskApi.create(data);
      setTasks((prev) => [task, ...prev]);
      return task;
    }
    const task = { _id: `local-${Date.now()}`, ...data, completed: false, createdAt: new Date().toISOString() };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, [usingApi]);

  const updateTask = useCallback(async (id, data) => {
    if (usingApi) {
      const updated = await taskApi.update(id, data);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      return updated;
    }
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...data } : t)));
  }, [usingApi]);

  const deleteTask = useCallback(async (id) => {
    if (usingApi) await taskApi.remove(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, [usingApi]);

  const toggleComplete = useCallback(async (id) => {
    if (usingApi) {
      const updated = await taskApi.toggleDone(id);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
    );
  }, [usingApi]);

  return (
    <TaskContext.Provider value={{ tasks, loading, error, createTask, updateTask, deleteTask, toggleComplete }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used inside TaskProvider');
  return ctx;
}
