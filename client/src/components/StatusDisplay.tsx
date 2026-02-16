interface StatusDisplayProps {
  isConnected: boolean;
  isConnecting: boolean;
  tick: number;
  winner?: string;
}

export const StatusDisplay = ({ 
  isConnected, 
  isConnecting, 
  tick, 
  winner 
}: StatusDisplayProps) => {
  const getConnectionStatus = () => {
    if (isConnecting) return 'CONNECTING...';
    if (isConnected) return 'LIVE';
    return 'DISCONNECTED';
  };

  const statusClass = isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected';

  return (
    <div className="status-display">
      <div className={`connection-status ${statusClass}`}>
        <span className="status-indicator"></span>
        {getConnectionStatus()}
      </div>
      <div className="tick-counter">
        TICK: {tick}
      </div>
      {winner && (
        <div className="winner-overlay">
          <div className="winner-content">
            <div className="winner-title">MATCH END</div>
            <div className="winner-name">{winner} WINS!</div>
            <div className="winner-subtitle">Next match starting soon...</div>
          </div>
        </div>
      )}
    </div>
  );
};
