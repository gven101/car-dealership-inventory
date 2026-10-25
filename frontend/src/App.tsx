import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import GaragePage from './pages/GaragePage';

export default function App() {
  return (
    <Routes>
      {/* key forces a fresh form when switching login <-> register */}
      <Route path="/login" element={<GuestRoute><AuthPage key="login" mode="login" /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AuthPage key="register" mode="register" /></GuestRoute>} />
      <Route path="/" element={<ProtectedRoute><GaragePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}