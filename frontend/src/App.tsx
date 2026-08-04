import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { AssistantPage } from './pages/AssistantPage';
import { DataViewerPage } from './pages/DataViewerPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

function ProtectedAdminRoute() {
  const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
  if (!isLoggedIn) {
    return <LoginPage />;
  }
  return <AdminPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/viewer" element={<DataViewerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
