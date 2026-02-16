interface HealthBarProps {
  health: number;
  maxHealth: number;
  label: string;
  color: 'cyan' | 'magenta';
}

export const HealthBar = ({ health, maxHealth, label, color }: HealthBarProps) => {
  const percentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  
  // Color gradient based on health percentage
  const getHealthColor = () => {
    if (percentage > 60) return color === 'cyan' ? '#00ffff' : '#ff00ff';
    if (percentage > 30) return '#ffff00';
    return '#ff0000';
  };

  const barColor = getHealthColor();

  return (
    <div className={`health-bar-container ${color}`}>
      <div className="health-bar-label">{label}</div>
      <div className="health-bar-outer">
        <div 
          className="health-bar-inner" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: barColor,
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }}
        />
      </div>
      <div className="health-bar-text">
        {Math.round(health)} / {maxHealth}
      </div>
    </div>
  );
};
