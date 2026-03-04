import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useUIStore, isFirstVisit } from './stores/uiStore';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/common/Navbar';
import NotificationToast from './components/common/NotificationToast';
import HowToPlay from './components/common/HowToPlay';
import GuidedTour from './components/common/GuidedTour';
import ThemeProvider from './components/common/ThemeProvider';
import LearnPage from './pages/LearnPage';
import { homeTourSteps, lobbyTourSteps, gameTourSteps } from './components/common/tourSteps';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const showTour = useUIStore((s) => s.showTour);
  const tourContext = useUIStore((s) => s.tourContext);
  const closeTour = useUIStore((s) => s.closeTour);
  const startTour = useUIStore((s) => s.startTour);
  const location = useLocation();

  // Auto-start tour for first-time visitors on the home page
  useEffect(() => {
    if (isFirstVisit() && location.pathname === '/') {
      const timer = setTimeout(() => startTour('home'), 800);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tourSteps =
    tourContext === 'game'
      ? gameTourSteps
      : tourContext === 'lobby'
        ? lobbyTourSteps
        : homeTourSteps;

  return (
    <div className="min-h-screen text-gray-100">
      <ThemeProvider />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <LobbyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:gameId"
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
        }}
      />
      <NotificationToast />
      <HowToPlay />
      <GuidedTour
        steps={tourSteps}
        isOpen={showTour}
        onClose={closeTour}
        tourKey="snakes-tour-seen"
      />
    </div>
  );
}
