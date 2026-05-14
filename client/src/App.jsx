import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import BoardPage from './pages/BoardPage';
import LoginPage from './pages/LoginPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/board" replace />} />
        </Routes>
      </TaskProvider>
    </BrowserRouter>
  );
}
