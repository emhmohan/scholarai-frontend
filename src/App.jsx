import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

import LandingPage           from './pages/LandingPage';
import LoginPage             from './pages/LoginPage';
import AuthCallbackPage      from './pages/AuthCallbackPage';
import DashboardPage         from './pages/DashboardPage';
import ScholarshipsPage      from './pages/ScholarshipsPage';
import CollegePage           from './pages/CollegePage';
import SOPPage               from './pages/SOPPage';
import LORPage               from './pages/LORPage';
import ResumePage            from './pages/ResumePage';
import ChecklistPage         from './pages/ChecklistPage';
import InterviewPage         from './pages/InterviewPage';
import EssayBankPage         from './pages/EssayBankPage';
import BudgetPage            from './pages/BudgetPage';
import CalendarPage          from './pages/CalendarPage';
import AnalyticsPage         from './pages/AnalyticsPage';
import NotificationsPage     from './pages/NotificationsPage';
import ComparisonPage        from './pages/ComparisonPage';
import ProfilePage           from './pages/ProfilePage';
import ReviewPage            from './pages/ReviewPage';
import RecommenderPortalPage from './pages/RecommenderPortalPage';
import Layout                from './components/shared/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        {/* OAuth callback — public */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Public review pages */}
        <Route path="/review/:token"      element={<ReviewPage />} />
        <Route path="/recommender/:token" element={<RecommenderPortalPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
        <Route path="/scholarships" element={
          <ProtectedRoute><Layout><ScholarshipsPage /></Layout></ProtectedRoute>} />
        <Route path="/colleges" element={
          <ProtectedRoute><Layout><CollegePage /></Layout></ProtectedRoute>} />
        <Route path="/sop" element={
          <ProtectedRoute><Layout><SOPPage /></Layout></ProtectedRoute>} />
        <Route path="/lor" element={
          <ProtectedRoute><Layout><LORPage /></Layout></ProtectedRoute>} />
        <Route path="/resume" element={
          <ProtectedRoute><Layout><ResumePage /></Layout></ProtectedRoute>} />
        <Route path="/checklist" element={
          <ProtectedRoute><Layout><ChecklistPage /></Layout></ProtectedRoute>} />
        <Route path="/interview" element={
          <ProtectedRoute><Layout><InterviewPage /></Layout></ProtectedRoute>} />
        <Route path="/essays" element={
          <ProtectedRoute><Layout><EssayBankPage /></Layout></ProtectedRoute>} />
        <Route path="/budget" element={
          <ProtectedRoute><Layout><BudgetPage /></Layout></ProtectedRoute>} />
        <Route path="/calendar" element={
          <ProtectedRoute><Layout><CalendarPage /></Layout></ProtectedRoute>} />
        <Route path="/analytics" element={
          <ProtectedRoute><Layout><AnalyticsPage /></Layout></ProtectedRoute>} />
        <Route path="/notifications" element={
          <ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
        <Route path="/comparison" element={
          <ProtectedRoute><Layout><ComparisonPage /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={
          <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}