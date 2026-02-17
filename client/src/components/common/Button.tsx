import styled from 'styled-components';
import { theme } from '../../theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
}

const Button = styled.button<ButtonProps>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.variant === 'secondary' ? theme.colors.bg.tertiary : theme.colors.accent.success};
  color: ${props => props.variant === 'secondary' ? theme.colors.text.primary : theme.colors.bg.primary};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export default Button;
