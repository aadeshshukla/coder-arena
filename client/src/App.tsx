import { Arena } from './components/Arena';
import { useArenaState } from './hooks/useArenaState';
import './styles/Arena.css';

function App() {
  const { matchState, isConnected, isConnecting } = useArenaState();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">⚔️ CODER ARENA ⚔️</h1>
        <p className="app-subtitle">24/7 Live AI Battle Stream</p>
      </header>
      <Arena 
        matchState={matchState} 
        isConnected={isConnected}
        isConnecting={isConnecting}
      />
    </div>
  );
}

export default App;
