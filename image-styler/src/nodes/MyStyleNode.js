import React, { useState, useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import '../styles/Nodes.css';

function MyStyleNode({ data, isConnectable }) {
  const [customStyle, setCustomStyle] = useState(data.customStyle || {
    title: '',
    materials: [{ type: '', description: '' }],
    lighting: { intensity: '', source: '', effects: '' },
    colorPalette: { primary: '#000000', secondary: '#ffffff' },
    background: { type: '', mood: '' },
    moodKeywords: []
  });

  const [currentKeyword, setCurrentKeyword] = useState('');

  const updateStyle = (path, value) => {
    const newStyle = { ...customStyle };
    const pathArray = path.split('.');
    let current = newStyle;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;
    
    setCustomStyle(newStyle);
    data.customStyle = newStyle;
    updateStyledOutput(newStyle);
  };

  const updateStyledOutput = useCallback((styleData = customStyle) => {
    // Generate styled output for chaining
    if (data.textInput && styleData.title) {
      const materials = styleData.materials?.map(m => m.type || m.description).join(', ') || '';
      const lighting = styleData.lighting ? `${styleData.lighting.intensity} ${styleData.lighting.source || ''}`.trim() : '';
      const keywords = styleData.moodKeywords?.join(', ') || '';
      
      const styledOutput = `${data.textInput}. Style: ${styleData.title}. Materials: ${materials}. Lighting: ${lighting}. Mood: ${keywords}. Background: ${styleData.background?.type || 'neutral'}.`;
      data.styledOutput = styledOutput;
      data.text = styledOutput; // Also set as text for chaining
    }
  }, [data, customStyle]);

  // Update output when text input changes
  useEffect(() => {
    updateStyledOutput();
  }, [data.textInput, updateStyledOutput]);

  const addKeyword = () => {
    if (currentKeyword.trim()) {
      const newKeywords = [...(customStyle.moodKeywords || []), currentKeyword.trim()];
      updateStyle('moodKeywords', newKeywords);
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (index) => {
    const newKeywords = (customStyle.moodKeywords || []).filter((_, i) => i !== index);
    updateStyle('moodKeywords', newKeywords);
  };

  return (
    <div className="custom-node my-style-node">
      <div className="node-header">
        <span className="node-icon">✨</span>
        <span className="node-title">My Style</span>
      </div>
      
      <div className="node-content">
        <div className="custom-style-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={customStyle.title}
              onChange={(e) => updateStyle('title', e.target.value)}
              placeholder="My Custom Style"
            />
          </div>

          <div className="form-group">
            <label>Material Type</label>
            <input
              type="text"
              value={customStyle.materials[0]?.type || ''}
              onChange={(e) => updateStyle('materials.0.type', e.target.value)}
              placeholder="e.g., Glossy metal, Soft fabric"
            />
          </div>

          <div className="form-group">
            <label>Lighting</label>
            <select
              value={customStyle.lighting?.intensity || ''}
              onChange={(e) => updateStyle('lighting.intensity', e.target.value)}
            >
              <option value="">Select intensity</option>
              <option value="Soft">Soft</option>
              <option value="Medium">Medium</option>
              <option value="Strong">Strong</option>
              <option value="Dramatic">Dramatic</option>
            </select>
          </div>

          <div className="form-group">
            <label>Primary Color</label>
            <input
              type="color"
              value={customStyle.colorPalette?.primary || '#000000'}
              onChange={(e) => updateStyle('colorPalette.primary', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mood Keywords</label>
            <div className="keyword-input">
              <input
                type="text"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                placeholder="Add keyword"
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <button onClick={addKeyword}>+</button>
            </div>
            <div className="keywords-list">
              {(customStyle.moodKeywords || []).map((keyword, i) => (
                <span key={i} className="keyword-tag">
                  {keyword}
                  <button onClick={() => removeKeyword(i)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="text-input"
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="styled-output"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default MyStyleNode;