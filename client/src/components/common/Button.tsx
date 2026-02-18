import styled from 'styled-components';
import { theme } from '../../theme';

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'success' | 'tertiary';
}

const Button = styled.button<ButtonProps>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => 
    props.$variant === 'secondary' ? theme.colors.bg.tertiary :
    props.$variant === 'success' ? theme.colors.accent.success :
    props.$variant === 'tertiary' ? 'transparent' :
    theme.colors.accent.success};
  color: ${props => 
    props.$variant === 'secondary' ? theme.colors.text.primary : 
    props.$variant === 'tertiary' ? theme.colors.text.secondary :
    theme.colors.bg.primary};
  border: ${props => props.$variant === 'tertiary' ? `2px solid ${theme.colors.bg.tertiary}` : 'none'};
  
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
