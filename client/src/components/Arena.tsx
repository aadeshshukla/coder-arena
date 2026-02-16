import { Fighter } from './Fighter';
import { HealthBar } from './HealthBar';
import { StatusDisplay } from './StatusDisplay';
import { MatchState } from '../hooks/useArenaState';

interface ArenaProps {
  matchState: MatchState | null;
  isConnected: boolean;
  isConnecting: boolean;
}

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;

export const Arena = ({ matchState, isConnected, isConnecting }: ArenaProps) => {
  if (!matchState) {
    return (
      <div className="arena-container">
        <div className="arena" style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}>
          <div className="loading-message">
            {isConnecting ? 'Connecting to arena...' : 'Waiting for match data...'}
          </div>
        </div>
      </div>
    );
  }

  const { fighterA, fighterB, tick, winner } = matchState;

  return (
    <div className="arena-container">
      <StatusDisplay 
        isConnected={isConnected} 
        isConnecting={isConnecting} 
        tick={tick}
        winner={winner}
      />
      
      <div className="health-bars">
        <HealthBar 
          health={fighterA.health} 
          maxHealth={fighterA.maxHealth} 
          label="Fighter A"
          color="cyan"
        />
        <HealthBar 
          health={fighterB.health} 
          maxHealth={fighterB.maxHealth} 
          label="Fighter B"
          color="magenta"
        />
      </div>

      <div className="arena" style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}>
        <div className="arena-grid"></div>
        <Fighter 
          fighter={fighterA} 
          color="cyan" 
          arenaWidth={ARENA_WIDTH}
          arenaHeight={ARENA_HEIGHT}
        />
        <Fighter 
          fighter={fighterB} 
          color="magenta" 
          arenaWidth={ARENA_WIDTH}
          arenaHeight={ARENA_HEIGHT}
        />
      </div>
    </div>
  );
};
