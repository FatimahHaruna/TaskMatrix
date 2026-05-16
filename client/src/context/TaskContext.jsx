import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskApi } from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(false);

  // True whenever there is a real authenticated user (not guest, not null)
  const isAuthenticated = !!(user && !user.isGuest);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [active, trashed] = await Promise.all([taskApi.getAll(), taskApi.getTrash()]);
      setTasks(active);
      setTrash(trashed);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.isGuest) {
      setTasks([]);
      setTrash([]);
      return;
    }
    loadTasks();
  }, [user?._id, user?.isGuest, loadTasks]);

  const createTask = useCallback(async (data) => {
    if (isAuthenticated) {
      const task = await taskApi.create(data);
      setTasks((p) => [task, ...p]);
      return task;
    }
    const task = { _id: `local-${Date.now()}`, ...data, completed: false, deleted: false, comments: [], activity: [], createdAt: new Date().toISOString() };
    setTasks((p) => [task, ...p]);
    return task;
  }, [isAuthenticated]);

  const updateTask = useCallback(async (id, data) => {
    if (isAuthenticated) {
      const updated = await taskApi.update(id, data);
      setTasks((p) => p.map((t) => (t._id === id ? updated : t)));
      return updated;
    }
    setTasks((p) => p.map((t) => (t._id === id ? { ...t, ...data } : t)));
  }, [isAuthenticated]);

  const deleteTask = useCallback(async (id) => {
    const target = tasks.find((t) => t._id === id);
    if (isAuthenticated) {
      await taskApi.remove(id);
    }
    setTasks((p) => p.filter((t) => t._id !== id));
    if (target) setTrash((p) => [{ ...target, deleted: true, deletedAt: new Date().toISOString() }, ...p]);
  }, [isAuthenticated, tasks]);

  const restoreTask = useCallback(async (id) => {
    const target = trash.find((t) => t._id === id);
    if (isAuthenticated) {
      const restored = await taskApi.restore(id);
      setTasks((p) => [restored, ...p]);
    } else if (target) {
      setTasks((p) => [{ ...target, deleted: false }, ...p]);
    }
    setTrash((p) => p.filter((t) => t._id !== id));
  }, [isAuthenticated, trash]);

  const permanentDelete = useCallback(async (id) => {
    if (isAuthenticated) await taskApi.permanentDelete(id);
    setTrash((p) => p.filter((t) => t._id !== id));
  }, [isAuthenticated]);

  const toggleComplete = useCallback(async (id) => {
    if (isAuthenticated) {
      const updated = await taskApi.toggleDone(id);
      setTasks((p) => p.map((t) => (t._id === id ? updated : t)));
      return;
    }
    setTasks((p) => p.map((t) => t._id === id ? { ...t, completed: !t.completed } : t));
  }, [isAuthenticated]);

  const addComment = useCallback(async (id, body) => {
    if (isAuthenticated) {
      const updated = await taskApi.addComment(id, body);
      setTasks((p) => p.map((t) => (t._id === id ? updated : t)));
      return updated;
    }
    const comment = { _id: `c-${Date.now()}`, user: 'me', body, createdAt: new Date().toISOString() };
    setTasks((p) => p.map((t) => t._id === id ? { ...t, comments: [...(t.comments || []), comment] } : t));
  }, [isAuthenticated]);

  const moveTask = useCallback(async (id, newQuadrant, newOrder) => {
    setTasks((p) => p.map((t) => t._id === id ? { ...t, quadrant: newQuadrant, order: newOrder } : t));
    if (isAuthenticated) {
      try { await taskApi.update(id, { quadrant: newQuadrant, order: newOrder }); } catch {}
    }
  }, [isAuthenticated]);

  return (
    <TaskContext.Provider value={{ tasks, trash, loading, usingApi: isAuthenticated, createTask, updateTask, deleteTask, restoreTask, permanentDelete, toggleComplete, addComment, moveTask, reload: loadTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be inside TaskProvider');
  return ctx;
}
