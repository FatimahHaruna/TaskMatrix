import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskApi } from '../services/api';

const TaskContext = createContext(null);

const SEED = [
  { _id: 's1', title: 'Finish CS101 lab report — due tonight', quadrant: 'q1', priority: 'High', labels: ['cs101'], dueDate: new Date().toISOString(), completed: false, assignee: 'me', comments: [], activity: [] },
  { _id: 's2', title: 'Email Prof. Nguyen about midterm absence', quadrant: 'q1', priority: 'High', labels: ['email'], completed: false, assignee: 'me', comments: [], activity: [] },
  { _id: 's3', title: 'Study for Linear Algebra midterm · Ch. 5–8', quadrant: 'q2', priority: 'Medium', labels: ['math240', 'study'], completed: false, assignee: 'me', comments: [], activity: [] },
  { _id: 's4', title: 'Draft thesis proposal before advisor meeting', quadrant: 'q2', priority: 'Medium', labels: ['thesis'], completed: false, assignee: 'me', comments: [], activity: [] },
  { _id: 's5', title: 'Apply for Stripe summer internship', quadrant: 'q2', priority: 'Medium', labels: ['career'], completed: false, assignee: 'me', comments: [], activity: [] },
  { _id: 's6', title: 'Pick up textbook holds at library', quadrant: 'q3', priority: 'Low', labels: ['errand'], completed: false, assignee: 'leo', comments: [], activity: [] },
  { _id: 's7', title: 'Coordinate shared notes doc for study group', quadrant: 'q3', priority: 'Low', labels: ['math240'], completed: false, assignee: 'omar', comments: [], activity: [] },
  { _id: 's8', title: 'Reorganize Discord study servers', quadrant: 'q4', priority: 'Low', labels: ['ops'], completed: false, assignee: 'me', comments: [], activity: [] },
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(SEED);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingApi, setUsingApi] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [active, trashed] = await Promise.all([taskApi.getAll(), taskApi.getTrash()]);
      setTasks(active);
      setTrash(trashed);
      setUsingApi(true);
    } catch {
      // server unavailable — keep seed data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const createTask = useCallback(async (data) => {
    if (usingApi) {
      const task = await taskApi.create(data);
      setTasks((p) => [task, ...p]);
      return task;
    }
    const task = { _id: `local-${Date.now()}`, ...data, completed: false, deleted: false, comments: [], activity: [], createdAt: new Date().toISOString() };
    setTasks((p) => [task, ...p]);
    return task;
  }, [usingApi]);

  const updateTask = useCallback(async (id, data) => {
    if (usingApi) {
      const updated = await taskApi.update(id, data);
      setTasks((p) => p.map((t) => (t._id === id ? updated : t)));
      return updated;
    }
    setTasks((p) => p.map((t) => (t._id === id ? { ...t, ...data } : t)));
  }, [usingApi]);

  const deleteTask = useCallback(async (id) => {
    const target = tasks.find((t) => t._id === id);
    if (usingApi) {
      await taskApi.remove(id);
    }
    setTasks((p) => p.filter((t) => t._id !== id));
    if (target) setTrash((p) => [{ ...target, deleted: true, deletedAt: new Date().toISOString() }, ...p]);
  }, [usingApi, tasks]);

  const restoreTask = useCallback(async (id) => {
    const target = trash.find((t) => t._id === id);
    if (usingApi) {
      const restored = await taskApi.restore(id);
      setTasks((p) => [restored, ...p]);
    } else if (target) {
      setTasks((p) => [{ ...target, deleted: false }, ...p]);
    }
    setTrash((p) => p.filter((t) => t._id !== id));
  }, [usingApi, trash]);

  const permanentDelete = useCallback(async (id) => {
    if (usingApi) await taskApi.permanentDelete(id);
    setTrash((p) => p.filter((t) => t._id !== id));
  }, [usingApi]);

  const toggleComplete = useCallback(async (id) => {
    if (usingApi) {
      const updated = await taskApi.toggleDone(id);
      setTasks((p) => p.map((t) => (t._id === id ? updated : t)));
      return;
    }
    setTasks((p) => p.map((t) => t._id === id ? { ...t, completed: !t.completed } : t));
  }, [usingApi]);

  const addComment = useCallback(async (id, body) => {
    if (usingApi) {
      const updated = await taskApi.addComment(id, body);
      setTasks((p) => p.map((t) => (t._id === id ? updated : t)));
      return updated;
    }
    const comment = { _id: `c-${Date.now()}`, user: 'me', body, createdAt: new Date().toISOString() };
    setTasks((p) => p.map((t) => t._id === id ? { ...t, comments: [...(t.comments || []), comment] } : t));
  }, [usingApi]);

  const moveTask = useCallback(async (id, newQuadrant, newOrder) => {
    setTasks((p) => p.map((t) => t._id === id ? { ...t, quadrant: newQuadrant, order: newOrder } : t));
    if (usingApi) {
      try { await taskApi.update(id, { quadrant: newQuadrant, order: newOrder }); } catch {}
    }
  }, [usingApi]);

  return (
    <TaskContext.Provider value={{ tasks, trash, loading, usingApi, createTask, updateTask, deleteTask, restoreTask, permanentDelete, toggleComplete, addComment, moveTask, reload: loadTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be inside TaskProvider');
  return ctx;
}
