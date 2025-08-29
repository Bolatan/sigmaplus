import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import CookieConsent from 'react-cookie-consent';
import Dashboard from './pages/Dashboard';

import Settings from './pages/Settings';
import SurveyResponsePage from './pages/SurveyResponsePage';
import SurveyDetails from './pages/SurveyDetails';
import ClientDashboard from './pages/ClientDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import SurveyList from './pages/SurveyList';
import EditSurvey from './pages/EditSurvey';
import MarketResearch from './pages/MarketResearch';
import Surveys from './pages/Surveys';
import SurveyBuilderPage from './pages/SurveyBuilder';
import AdvancedAnalyticsPage from './pages/AdvancedAnalytics';
import MultiSurveyAnalysis from './pages/MultiSurveyAnalysis';
import DashboardModule from './pages/DashboardModule';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard-module" element={<DashboardModule />} />
      <Route path="/surveys/:surveyId/edit" element={<EditSurvey />} />
      <Route path="/surveys" element={<SurveyList />} />
      <Route path="/surveys/new" element={<Surveys />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:projectId" element={<ProjectDetails />} />
      <Route path="/surveys/:surveyId" element={<SurveyDetails />} />
      <Route path="/client-dashboard" element={<ClientDashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/surveys/:surveyId/respond" element={<SurveyResponsePage />} />
      <Route path="/market-research" element={<MarketResearch />} />
      <Route path="/survey-builder" element={<SurveyBuilderPage />} />
      <Route path="/advanced-analytics" element={<AdvancedAnalyticsPage />} />
      <Route path="/multi-survey-dashboard" element={<MultiSurveyAnalysis />} />
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
