import React, { useState } from 'react';
import '../styles/SettingsPanel.css';

function SettingsPanel({ openAIKey, setOpenAIKey, onClose }) {
  const [tempKey, setTempKey] = useState(openAIKey);

  const handleSave = () => {
    setOpenAIKey(tempKey);
    localStorage.setItem('openai_key', tempKey);
    onClose();
  };

  const handleClear = () => {
    setTempKey('');
    setOpenAIKey('');
    localStorage.removeItem('openai_key');
  };

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="openai-key">OpenAI API Key</label>
            <input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="key-input"
            />
            <p className="setting-description">
              Your API key is stored locally and never sent to our servers.
              Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a>.
            </p>
          </div>

          <div className="setting-group">
            <h4>About Image Styler</h4>
            <p>
              Create stunning styled images using AI. Connect text prompts to images and apply 
              various style presets to generate unique artwork.
            </p>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn btn-danger" onClick={handleClear}>
            Clear Key
          </button>
          <div>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;