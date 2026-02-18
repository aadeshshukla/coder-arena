import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { codeTemplates, CodeTemplate } from '../../utils/codeTemplates';

interface TemplateSelectorProps {
  onSelect: (template: CodeTemplate) => void;
}

const SelectorContainer = styled.div`
  margin-bottom: 16px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: ${theme.colors.bg.tertiary};
  color: ${theme.colors.text.primary};
  border: 2px solid ${theme.colors.bg.tertiary};
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.accent.blue};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.success};
  }

  option {
    background: ${theme.colors.bg.secondary};
    color: ${theme.colors.text.primary};
  }
`;

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateName = e.target.value;
    const template = codeTemplates.find(t => t.name === templateName);
    if (template) {
      onSelect(template);
    }
  };

  return (
    <SelectorContainer>
      <Select onChange={handleChange} defaultValue="">
        <option value="" disabled>Select a template...</option>
        {codeTemplates.map((template) => (
          <option key={template.name} value={template.name}>
            {template.name} - {template.description}
          </option>
        ))}
      </Select>
    </SelectorContainer>
  );
};

export default TemplateSelector;
