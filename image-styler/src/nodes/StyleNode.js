import React, { useState, useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { loadStylePresets } from '../utils/styleLoader';
import { generateSyntheticStyles } from '../utils/syntheticStyles';
import '../styles/Nodes.css';

function StyleNode({ data, isConnectable }) {
  const [selectedStyle, setSelectedStyle] = useState(data.selectedStyle || '');
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load style presets
    const loadStyles = async () => {
      try {
        const sampleStyles = await loadStylePresets();
        const syntheticStyles = generateSyntheticStyles();
        const allStyles = [...sampleStyles, ...syntheticStyles];
        setStyles(allStyles);
        setLoading(false);
      } catch (error) {
        console.error('Error loading styles:', error);
        setLoading(false);
      }
    };

    loadStyles();
  }, []);

  const handleStyleChange = (styleId) => {
    setSelectedStyle(styleId);
    data.selectedStyle = styleId;
    data.styleData = styles.find(s => s.id === styleId);
    updateStyledOutput();
  };

  const updateStyledOutput = useCallback(() => {
    // Generate styled output for chaining
    if (data.textInput && data.styleData) {
      const styleData = data.styleData;
      const materials = styleData.materials?.map(m => m.type || m.description).join(', ') || '';
      const lighting = styleData.lighting ? `${styleData.lighting.intensity} ${styleData.lighting.source || ''}`.trim() : '';
      const keywords = styleData.moodKeywords?.join(', ') || '';
      
      const styledOutput = `${data.textInput}. Style: ${styleData.title}. Materials: ${materials}. Lighting: ${lighting}. Mood: ${keywords}. Background: ${styleData.background?.type || 'neutral'}.`;
      data.styledOutput = styledOutput;
      data.text = styledOutput; // Also set as text for chaining
    }
  }, [data]);

  // Update output when text input changes
  useEffect(() => {
    updateStyledOutput();
  }, [data.textInput, updateStyledOutput]);

  return (
    <div className="custom-node style-node">
      <div className="node-header">
        <span className="node-icon">🎨</span>
        <span className="node-title">Style Preset</span>
      </div>
      
      <div className="node-content">
        {loading ? (
          <div>Loading styles...</div>
        ) : (
          <div className="style-selector">
            <select
              value={selectedStyle}
              onChange={(e) => handleStyleChange(e.target.value)}
              className="style-dropdown"
            >
              <option value="">Select a style...</option>
              {styles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.title}
                </option>
              ))}
            </select>
            
            {selectedStyle && (
              <div className="style-preview">
                {styles.find(s => s.id === selectedStyle)?.moodKeywords.map((keyword, i) => (
                  <span key={i} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            )}
          </div>
        )}
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

export default StyleNode;