import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import CookieConsent from 'react-cookie-consent';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Companies from './pages/Companies';
import SurveyResponsePage from './pages/SurveyResponsePage';
import SurveyDetails from './pages/SurveyDetails';
import ClientDashboard from './pages/ClientDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import EditReportSections from './pages/EditReportSections';
import SurveyList from './pages/SurveyList';
import EditSurvey from './pages/EditSurvey';
import MarketResearch from './pages/MarketResearch';
import Surveys from './pages/Surveys';
import SurveyBuilderPage from './pages/SurveyBuilder';
import AdvancedAnalyticsPage from './pages/AdvancedAnalytics';
import CollaborationPage from './pages/Collaboration';
import MultiSurveyAnalysis from './pages/MultiSurveyAnalysis';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
});

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
      } />
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'client' ? <Navigate to="/client-dashboard" /> : <Dashboard />}
        </ProtectedRoute>
      } />
        <Route path="/surveys/:surveyId/edit" element={
          <ProtectedRoute>
            <EditSurvey />
          </ProtectedRoute>
        } />
        <Route path="/surveys" element={
          <ProtectedRoute>
            <SurveyList />
          </ProtectedRoute>
        } />
        <Route path="/surveys/new" element={
          <ProtectedRoute>
            <Surveys />
          </ProtectedRoute>
        } />
        <Route path="/reports/:id/edit" element={
          <ProtectedRoute>
            <EditReportSections />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        } />
        <Route path="/projects/:projectId" element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        } />
        <Route path="/surveys/:surveyId" element={
          <ProtectedRoute>
            <SurveyDetails />
          </ProtectedRoute>
        } />
        <Route path="/client-dashboard" element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        {/*
          The original Surveys.tsx was likely renamed to Projects.tsx.
          To resolve the build error, we are now routing /surveys to the Projects component.
          If you intend to have separate "Surveys" and "Projects" pages, you will need to
          create a new Surveys.tsx file and component.
        */}
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Users /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/companies" element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Companies /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />
        <Route path="/surveys/:surveyId/respond" element={
          <ProtectedRoute>
            <SurveyResponsePage />
          </ProtectedRoute>
        } />
        <Route path="/market-research" element={<ProtectedRoute><MarketResearch /></ProtectedRoute>} />
        <Route path="/survey-builder" element={<ProtectedRoute><SurveyBuilderPage /></ProtectedRoute>} />
        <Route path="/advanced-analytics" element={<ProtectedRoute><AdvancedAnalyticsPage /></ProtectedRoute>} />
        <Route path="/collaboration" element={<ProtectedRoute><CollaborationPage /></ProtectedRoute>} />
        <Route path="/multi-survey-dashboard" element={
          <ProtectedRoute>
            <MultiSurveyAnalysis />
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
        <Layout>
          <AppRoutes />
        </Layout>
        <CookieConsent>
          This website uses cookies to enhance the user experience.
        </CookieConsent>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
