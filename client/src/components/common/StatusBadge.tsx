import styled from 'styled-components';
import { theme } from '../../theme';

interface StatusBadgeProps {
  status: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return theme.colors.accent.success;
    case 'in_queue':
      return theme.colors.accent.blue;
    case 'in_match':
      return theme.colors.accent.error;
    default:
      return theme.colors.text.secondary;
  }
};

const Badge = styled.div<StatusBadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  background: ${props => getStatusColor(props.status)}22;
  color: ${props => getStatusColor(props.status)};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const Dot = styled.div<StatusBadgeProps>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => getStatusColor(props.status)};
`;

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const displayStatus = status.replace('_', ' ');
  
  return (
    <Badge status={status}>
      <Dot status={status} />
      {displayStatus}
    </Badge>
  );
};

export default StatusBadge;
