import React, { useEffect, useState } from "react";
import "./InterpreterSettingsModal.css";
import WebInterpreterHooksConfig from '../../interpreter-hooks/WebInterpreterHooksConfig.js';

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
  const [asyncTime, setAsyncTime] = useState<number>(10);

  useEffect(() => {
    if (visible) {
      setAsyncTime(config.getAsyncTime());
    }
  }, [visible, config]);

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
