import React, { useState, KeyboardEvent } from 'react';
import './CommandLine.css'; // Import the CSS file


interface CommandResponse {
  accepted: boolean;
  error?: boolean;
  response?: string;
}

type CommandHistory = string[];


const CommandLine: React.FC<{maxLines: number}> = ({maxLines} : {maxLines : number}) => {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<CommandHistory>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [responses, setResponses] = useState<CommandResponse[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const executeCommand = async (command: string): Promise<CommandResponse> => {
    // Simulate an async operation with a promise
    return new Promise((resolve) => {
      setTimeout(() => {
        if (command.trim() === '') {
          resolve({ accepted: false });
        } else {
          resolve({
            accepted: true,
            error: false, // simulate command success or failure
            response: `Response to: ${command}`,
          });
        }
      }, 1000); // Simulate delay
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await executeCommand(input);

    if (result.accepted && result.response) {
      setResponses([...responses, { ...result, }]);
      setHistory([...history, input]);
      setHistoryIndex(history.length + 1);
    }
    setInput('');
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
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

  return (
    <div className="commandLineContainer">
      <div className="responseContainer" style={{ maxHeight: maxHeight }}>
        {responses.map((res, index) => (
          <p key={index} className={`response ${res.error ? 'responseError' : ''}`}>
            {res.response}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyUp={handleKeyUp}
          autoFocus
          className="commandInput"
        />
      </form>
    </div>
  );
};

export default CommandLine;
