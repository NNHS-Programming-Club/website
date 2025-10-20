import React, { useMemo, useEffect, useRef, useCallback, forwardRef } from 'react';
import Editor from '@monaco-editor/react';
import { monacoLanguageMap } from '../constants';

const CodeEditor = forwardRef(({ value, onChange, languageId = '92', height = '400px'}, ref) => {
  const editorRef = useRef(null);
  
  const language = useMemo(() => {
    const mappedLanguage = monacoLanguageMap[languageId] || 'python';
    console.log('Language ID:', languageId, 'Mapped to:', mappedLanguage);
    return mappedLanguage;
  }, [languageId]);

  // Debounced resize handler based on the article's approach
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  const handleResize = useCallback(() => {
    if (editorRef.current && ref.current) {
      // Squash editor to force repaint and get actual container size
      editorRef.current.layout({ width: 0, height: 0 });
      
      // Use requestAnimationFrame to ensure the squashing has taken effect
      requestAnimationFrame(() => {
        const containerRect = ref.current.getBoundingClientRect();
        editorRef.current.layout({
          width: containerRect.width,
          height: containerRect.height
        });
      });
    }
  }, [ref]);

  const debouncedResize = useMemo(() => debounce(handleResize, 100), [handleResize, debounce]);

  useEffect(() => {
    // Window resize listener
    window.addEventListener('resize', debouncedResize);
    
    // Container resize observer
    let resizeObserver;
    if (ref.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(debouncedResize);
      resizeObserver.observe(ref.current);
    }

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [debouncedResize]);

  const onMount = (editor, monaco) => {
    // Store editor reference
    editorRef.current = editor;
    
    // Define Gruvbox theme
    monaco.editor.defineTheme('gruvbox', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'ebdbb2', background: '282828' }, // default
        { token: 'comment', foreground: '928374', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'fb4934' },
        { token: 'number', foreground: 'd3869b' },
        { token: 'string', foreground: 'b8bb26' },
        { token: 'identifier', foreground: 'ebdbb2' },
        { token: 'delimiter', foreground: 'fe8019' },
        { token: 'type', foreground: 'fabd2f' },
        { token: 'function', foreground: 'b8bb26' },
        { token: 'variable', foreground: '83a598' },
        { token: 'constant', foreground: 'd3869b' },
        { token: 'class', foreground: 'fabd2f' },
        { token: 'interface', foreground: 'fabd2f' },
        { token: 'namespace', foreground: 'fabd2f' },
        { token: 'operator', foreground: 'fe8019' },
        // Add more as needed
      ],
      colors: {
        'editor.background': '#282828',
        'editor.foreground': '#ebdbb2',
        'editor.lineHighlightBackground': '#3c3836',
        'editorCursor.foreground': '#fe8019',
        'editorLineNumber.foreground': '#7c6f64',
        'editor.selectionBackground': '#504945',
        'editor.inactiveSelectionBackground': '#3c3836',
        'editorIndentGuide.background': '#3c3836',
        'editorIndentGuide.activeBackground': '#bdae93',
        // Add more as needed
      }
    });

    monaco.editor.setTheme('gruvbox');
    console.log("mounted")
    editor.focus();
    
    // Configure editor for syntax highlighting
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Consolas', 'Courier New', monospace",
      lineNumbers: 'on',
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      folding: true,
      matchBrackets: 'always',
      renderWhitespace: 'selection',
      tabSize: 4,
      insertSpaces: true,
      detectIndentation: true,
      scrollBeyondLastLine: false,
      // automaticLayout: true
    });
  };

  return (
    <div ref={ref} style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden'}}>
      <Editor
        options={{
          minimap: { enabled: false },
          lineNumbers: 'on',
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
          matchBrackets: 'always',
          fontSize: 14,
          fontFamily: "'Consolas', 'Courier New', monospace",
          // automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          tabSize: 4,
          insertSpaces: true,
          detectIndentation: true
        }}
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        onMount={onMount}
        theme="gruvbox"
      />
    </div>
  );
});

export default CodeEditor;