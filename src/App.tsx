import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import CookieConsent from 'react-cookie-consent';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// REMOVED: import Surveys from './pages/Surveys.tsx'; // This import is causing the error
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Companies from './pages/Companies';
import SurveyResponsePage from './pages/SurveyResponsePage';
import SurveyDetails from './pages/SurveyDetails';
import ClientDashboard from './pages/ClientDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Projects from './pages/Projects'; // Correctly importing the Projects component
import EditReportSections from './pages/EditReportSections';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            {user?.role === 'client' ? <Navigate to="/client-dashboard" /> : <Dashboard />}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <EditReportSections />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute>
          <Layout>
            <Projects />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/surveys/:surveyId" element={
        <ProtectedRoute>
          <Layout>
            <SurveyDetails />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/client-dashboard" element={
        <ProtectedRoute>
          <Layout>
            <ClientDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      {/*
        This route now uses the 'Projects' component, as 'Surveys.tsx' was likely
        refactored into 'Projects.tsx'. If you need a separate 'Surveys' page
        in the future, you will need to create a new file and component for it.
      */}
      <Route path="/surveys" element={
        <ProtectedRoute>
          <Layout>
            <Projects /> {/* Renders the Projects component for the /surveys path */}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <Layout>
            {user?.role === 'admin' ? <Users /> : <Navigate to="/" />}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/companies" element={
        <ProtectedRoute>
          <Layout>
            {user?.role === 'admin' ? <Companies /> : <Navigate to="/" />}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/surveys/:surveyId/respond" element={
        <ProtectedRoute>
          <Layout>
            <SurveyResponsePage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <CookieConsent>
          This website uses cookies to enhance the user experience.
        </CookieConsent>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
