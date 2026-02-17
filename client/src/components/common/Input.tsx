import styled from 'styled-components';
import { theme } from '../../theme';

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid ${theme.colors.bg.tertiary};
  border-radius: 8px;
  background: ${theme.colors.bg.secondary};
  color: ${theme.colors.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.success};
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

export default Input;
