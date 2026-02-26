import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Brainstorm from './pages/Brainstorm';
import Generator from './pages/Generator';
import UIGenerator from './pages/UIGenerator';
import Settings from './pages/Settings';
import Chatbot from './pages/Chatbot';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="brainstorm" element={<Brainstorm />} />
              <Route path="generator" element={<Generator />} />
              <Route path="ui-generator" element={<UIGenerator />} />
              <Route path="settings" element={<Settings />} />
              <Route path="chatbot" element={<Chatbot />} />
            </Route>
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}
