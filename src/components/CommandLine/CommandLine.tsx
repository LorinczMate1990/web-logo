import React, { useState, KeyboardEvent, useRef } from 'react';
import './CommandLine.css'; // Import the CSS file
import Interpreter from '../../controllers/Interpreter';

interface CommandResponse {
  accepted: boolean;
  error?: boolean;
  response?: string;
}

const DEFAULT_INDENT_LEVEL = 3;

type CommandHistory = string[];

const CommandLine: React.FC<{ maxLines: number }> = ({ maxLines }: { maxLines: number }) => {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<CommandHistory>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [responses, setResponses] = useState<CommandResponse[]>([]);
  const interpreter = useRef<Interpreter>(new Interpreter());

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const executeCommand = async (command: string): Promise<CommandResponse> => {
    await interpreter.current.execute(command);
    return {
      accepted: true,
      error: false,
      response: command,
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await executeCommand(input);

    if (result.accepted && result.response) {
      setResponses([...responses, { ...result }]);
      setHistory([...history, input]);
      setHistoryIndex(history.length + 1);
    }
    setInput('');
  };

  const getIndentationLevel = (text: string): number => {
    const lines = text.split('\n');
    let indentLevel = 0;
    lines.forEach((line) => {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      indentLevel += openBraces - closeBraces;
    });
    return Math.max(0, indentLevel);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const currentIndentLevel = getIndentationLevel(input);
      const newIndentation = ' '.repeat(currentIndentLevel * DEFAULT_INDENT_LEVEL); // 3 spaces per indentation level
      setInput((prevInput) => `${prevInput}\n${newIndentation}`);
    } else if (e.key === '}') {
      // Detect if there are three spaces before the `}` character and delete them
      setInput((prevInput) => {
        const lastThreeChars = prevInput.slice(-DEFAULT_INDENT_LEVEL);
        if (lastThreeChars === '   ') {
          return prevInput.slice(0, -DEFAULT_INDENT_LEVEL) + '}';
        } else {
          return prevInput + '}';
        }
      });
      e.preventDefault();
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp') {
      const newIndex = Math.max(historyIndex - 1, 0);
      setHistoryIndex(newIndex);
      setInput(history[newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      const newIndex = Math.min(historyIndex + 1, history.length);
      setHistoryIndex(newIndex);
      setInput(history[newIndex] || '');
    }
  };

  const lineHeight = 20; // Example line height in pixels
  const maxHeight = `${lineHeight * maxLines}px`;

  const formatResponse = (response: string) => {
    return response.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="commandLineContainer">
      <div className="responseContainer" style={{ maxHeight: maxHeight }}>
        {responses.map((res, index) => (
          <p
            key={index}
            className={`response ${res.error ? 'responseError' : ''}`}
            style={{ backgroundColor: index % 2 === 0 ? '#000000' : '#404040' }} // Alternating background colors
          >
            {formatResponse(res.response || '')}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          autoFocus
          className="commandInput"
          style={{ height: `${Math.min(input.split('\n').length * lineHeight, lineHeight * maxLines)}px` }}
        />
      </form>
    </div>
  );
};

export default CommandLine;
