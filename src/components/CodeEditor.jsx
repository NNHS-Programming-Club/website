import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { monacoLanguageMap } from '../constants';
import { syntaxHighlighting } from '@codemirror/language';
import {tags} from "@lezer/highlight"
import {HighlightStyle} from "@codemirror/language"

const CodeEditor = ({ value, onChange, languageId = '92', height = '400px' }) => {
  const myHighlightStyle = HighlightStyle.define([
    {tag: tags.keyword, color: "#fc6", fontWeight: "bold"},
    {tag: tags.comment, color: "#f5d", fontStyle: "italic"},
    {tag: tags.string, color: "#0ff"},
    {tag: tags.number, color: "#0f0"},
    {tag: tags.operator, color: "#ff0"},
    {tag: tags.function, color: "#f0f"},
    {tag: tags.variableName, color: "#fff"},
    {tag: tags.typeName, color: "#0ff"},
    {tag: tags.className, color: "#0ff"},
    {tag: tags.propertyName, color: "#ff0"}
  ])

  const getLanguageFromId = (langId) => {
    return monacoLanguageMap[langId] || 'python';
  };

  const getLanguageExtension = (langId) => {
    const language = getLanguageFromId(langId);
    switch (language) {
      case 'python':
        return python();
      case 'cpp':
        return cpp();
      case 'java':
        return java();
      default:
        return python();
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
      <CodeMirror
        value={value}
        onChange={onChange}
        height={height}
        theme={oneDark}
        extensions={[getLanguageExtension(languageId), syntaxHighlighting(myHighlightStyle)]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: false,
          searchKeymap: true,
        }}
        placeholder="Enter your code here..."
      />
    </div>
  );
};

export default CodeEditor;