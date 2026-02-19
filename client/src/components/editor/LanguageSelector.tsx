import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { CodeLanguage } from '../../../../shared/types/match';

interface LanguageSelectorProps {
  value: CodeLanguage;
  onChange: (language: CodeLanguage) => void;
}

const SelectorContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const LanguageButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 16px;
  background: ${props => props.$active ? theme.colors.accent.blue : theme.colors.bg.tertiary};
  color: ${props => props.$active ? theme.colors.bg.primary : theme.colors.text.primary};
  border: 2px solid ${props => props.$active ? theme.colors.accent.blue : theme.colors.bg.tertiary};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    border-color: ${theme.colors.accent.blue};
  }
`;

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  return (
    <SelectorContainer>
      <LanguageButton $active={value === 'CASL'} onClick={() => onChange('CASL')}>
        CASL
      </LanguageButton>
      <LanguageButton $active={value === 'JS'} onClick={() => onChange('JS')}>
        JavaScript
      </LanguageButton>
    </SelectorContainer>
  );
};

export default LanguageSelector;
