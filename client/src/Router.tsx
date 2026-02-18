import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LobbyPage from './pages/LobbyPage';
import QueuePage from './pages/QueuePage';
import EditorPage from './pages/EditorPage';
import BattlePage from './pages/BattlePage';
import ResultsPage from './pages/ResultsPage';
import SpectatorPage from './pages/SpectatorPage';
import { useAuth } from './contexts/AuthContext';

export default function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#0a0e27',
        color: '#00ff88',
        fontSize: '20px'
      }}>
        Loading...
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/lobby" />} />
        <Route path="/lobby" element={isAuthenticated ? <LobbyPage /> : <Navigate to="/" />} />
        <Route path="/queue" element={isAuthenticated ? <QueuePage /> : <Navigate to="/" />} />
        <Route path="/editor/:matchId" element={isAuthenticated ? <EditorPage /> : <Navigate to="/" />} />
        <Route path="/battle/:matchId" element={isAuthenticated ? <BattlePage /> : <Navigate to="/" />} />
        <Route path="/results/:matchId" element={isAuthenticated ? <ResultsPage /> : <Navigate to="/" />} />
        <Route path="/spectator" element={isAuthenticated ? <SpectatorPage /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
