import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { LanguageStep } from './pages/Onboarding/LanguageStep';
import { RegisterStep } from './pages/Onboarding/RegisterStep';
import { LoginStep } from './pages/Onboarding/LoginStep';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ArchivePage } from './pages/Archive/ArchivePage';
import { RemindersPage } from './pages/Reminders/RemindersPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { CreditsPage } from './pages/Credits/CreditsPage';
import { SoundSettingsPage } from './pages/Sound/SoundSettingsPage';
import { CallingSettingsPage } from './pages/Calling/CallingSettingsPage';
import { SmsSettingsPage } from './pages/Sms/SmsSettingsPage';
import { AppLayout } from './components/layout/AppLayout';
import { getRememberedEmail } from './lib/session';

// HashRouter — обязателен для Electron: file:// не работает с history API BrowserRouter'а.

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { session, loadingSession } = useApp();
  if (loadingSession) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

// Если человек уже пользовался приложением раньше (есть запомненный email),
// при отсутствии активной сессии его встречает быстрый вход, а не онбординг с нуля.
function EntryRoute() {
  const remembered = getRememberedEmail();
  return remembered ? <Navigate to="/login" replace /> : <Navigate to="/onboarding" replace />;
}

export default function App() {
  const { session, loadingSession } = useApp();

  if (loadingSession) return null;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <EntryRoute />} />
        <Route path="/onboarding" element={session ? <Navigate to="/dashboard" replace /> : <LanguageStep />} />
        <Route
          path="/onboarding/register"
          element={session ? <Navigate to="/dashboard" replace /> : <RegisterStep />}
        />
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginStep />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/archive"
          element={
            <PrivateRoute>
              <ArchivePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <PrivateRoute>
              <RemindersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <ReportsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/credits"
          element={
            <PrivateRoute>
              <CreditsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/sound"
          element={
            <PrivateRoute>
              <SoundSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/calling"
          element={
            <PrivateRoute>
              <CallingSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/sms"
          element={
            <PrivateRoute>
              <SmsSettingsPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
