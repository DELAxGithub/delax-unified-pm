import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProgramProvider } from './contexts/ProgramContext';
import { CalendarTaskProvider } from './contexts/CalendarTaskContext';
import { EpisodeProvider } from './contexts/EpisodeContext';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import Calendar from './components/Calendar';
import { EpisodeListPage } from './components/EpisodeListPage';
import EpisodeKanbanBoard from './components/EpisodeKanbanBoard';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-text-primary">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ProgramProvider>
                  <CalendarTaskProvider>
                    <EpisodeProvider>
                      <Layout />
                    </EpisodeProvider>
                  </CalendarTaskProvider>
                </ProgramProvider>
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/episodes" replace />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="episodes" element={<EpisodeListPage />} />
            <Route path="episodes/kanban" element={<EpisodeKanbanBoard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;