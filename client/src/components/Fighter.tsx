import { Fighter as FighterType } from '../hooks/useArenaState';

interface FighterProps {
  fighter: FighterType;
  color: 'cyan' | 'magenta';
  arenaWidth: number;
  arenaHeight: number;
}

const GAME_WIDTH = 10;  // Game coordinates range from 0-10
const GAME_HEIGHT = 10;

export const Fighter = ({ fighter, color, arenaWidth, arenaHeight }: FighterProps) => {
  // Map game coordinates (0-10) to pixel positions
  const pixelX = (fighter.position.x / GAME_WIDTH) * arenaWidth;
  const pixelY = (fighter.position.y / GAME_HEIGHT) * arenaHeight;

  const fighterSize = 40;
  const centerX = pixelX - fighterSize / 2;
  const centerY = pixelY - fighterSize / 2;

  return (
    <div
      className={`fighter ${color} ${fighter.attacking ? 'attacking' : ''} ${fighter.blocking ? 'blocking' : ''}`}
      style={{
        left: `${centerX}px`,
        top: `${centerY}px`,
        width: `${fighterSize}px`,
        height: `${fighterSize}px`,
        transition: 'left 0.1s linear, top 0.1s linear'
      }}
    >
      <div className="fighter-body"></div>
      {fighter.attacking && <div className="attack-effect"></div>}
      {fighter.blocking && <div className="block-effect"></div>}
    </div>
  );
};
