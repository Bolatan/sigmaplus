import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import AllSurveys from './pages/AllSurveys';
import EditSurvey from './pages/EditSurvey';
import MarketResearch from './pages/MarketResearch';
import SurveyBuilder from './pages/SurveyBuilder';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import Collaboration from './pages/Collaboration';
import MarketResearchTools from './pages/MarketResearchTools';

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
    <Layout>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/" element={
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
            <AllSurveys />
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
        <Route path="/market-research" element={
          <ProtectedRoute>
            <MarketResearch />
          </ProtectedRoute>
        } />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/survey-builder" element={
        <ProtectedRoute>
          <Layout>
            <SurveyBuilder />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/advanced-analytics" element={
        <ProtectedRoute>
          <Layout>
            <AdvancedAnalytics />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/collaboration" element={
        <ProtectedRoute>
          <Layout>
            <Collaboration />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/market-research-tools" element={
        <ProtectedRoute>
          <Layout>
            <MarketResearchTools />
          </Layout>
        </ProtectedRoute>
      } />
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
