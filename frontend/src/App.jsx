import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TestSuitePage from './pages/TestSuitePage';
import TestCaseFormPage from './pages/TestCaseFormPage';
import TestCaseDetailPage from './pages/TestCaseDetailPage';
import TestRunDetailPage from './pages/TestRunDetailPage';
import TestExecutionPage from './pages/TestExecutionPage';

function AppLayout({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return children;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
        <Route path="/projects/:projectId/suites/:suiteId" element={<ProtectedRoute><TestSuitePage /></ProtectedRoute>} />
        <Route path="/projects/:projectId/suites/:suiteId/cases/new" element={<ProtectedRoute><TestCaseFormPage /></ProtectedRoute>} />
        <Route path="/projects/:projectId/suites/:suiteId/cases/:caseId/edit" element={<ProtectedRoute><TestCaseFormPage /></ProtectedRoute>} />
        <Route path="/cases/:caseId" element={<ProtectedRoute><TestCaseDetailPage /></ProtectedRoute>} />
        <Route path="/runs/:runId" element={<ProtectedRoute><TestRunDetailPage /></ProtectedRoute>} />
        <Route path="/runs/:runId/execute/:resultId" element={<ProtectedRoute><TestExecutionPage /></ProtectedRoute>} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
