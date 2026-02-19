import React from 'react';
import Editor from '@monaco-editor/react';
import styled from 'styled-components';
import { theme } from '../../theme';

interface MonacoWrapperProps {
  value: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
  language?: string;
}

const EditorContainer = styled.div`
  height: 100%;
  border: 2px solid ${theme.colors.bg.tertiary};
  border-radius: 8px;
  overflow: hidden;
`;

const MonacoWrapper: React.FC<MonacoWrapperProps> = ({ value, onChange, readOnly = false, language = 'javascript' }) => {
  return (
    <EditorContainer>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </EditorContainer>
  );
};

export default MonacoWrapper;
