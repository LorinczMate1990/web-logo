import React, { useEffect, useState } from "react";
import "./InterpreterSettingsModal.css";
import WebInterpreterHooksConfig from '../../interpreter-hooks/WebInterpreterHooksConfig';

interface InterpreterSettingsModalProps {
  visible: boolean;
  config: WebInterpreterHooksConfig;
  onClose: () => void;
}

const InterpreterSettingsModal: React.FC<InterpreterSettingsModalProps> = ({
  visible,
  config,
  onClose,
}) => {
  const [killTime, setKillTime] = useState<number>(10000);
  const [asyncTime, setAsyncTime] = useState<number>(10);

  useEffect(() => {
    if (visible) {
      setKillTime(config.getKillTime());
      setAsyncTime(config.getAsyncTime());
    }
  }, [visible, config]);

  const handleKillTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(10000, parseInt(e.target.value));
    setKillTime(value);
    config.setKillTime(value);
  };

  const handleAsyncTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(10, Math.min(10000, parseInt(e.target.value)));
    setAsyncTime(value);
    config.setAsyncTime(value);
  };

  if (!visible) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2>Interpreter Settings</h2>

        <div className="input-group">
          <label>Set maximum runtime of the interpreter:</label>
          <input
            type="number"
            min={10000}
            value={killTime}
            onChange={handleKillTimeChange}
          />
          <span>ms</span>
        </div>

        <div className="input-group">
          <label>Set the responsivity of the interpreter:</label>
          <input
            type="number"
            min={10}
            max={10000}
            value={asyncTime}
            onChange={handleAsyncTimeChange}
          />
          <span>ms</span>
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default InterpreterSettingsModal;
