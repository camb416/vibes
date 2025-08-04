import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import '../styles/Nodes.css';

function MixNode({ data, isConnectable }) {
  const [mixPercentage, setMixPercentage] = useState(data.mixPercentage || 50);

  const buildMixedOutput = useCallback(() => {
    const input1 = data.input1 || '';
    const input2 = data.input2 || '';
    
    if (!input1 && !input2) return '';
    
    const percentage1 = mixPercentage;
    const percentage2 = 100 - mixPercentage;
    
    let mixedPrompt = '';
    if (input1) {
      mixedPrompt += `(${input1}:${percentage1}%)`;
    }
    if (input2) {
      if (mixedPrompt) mixedPrompt += ' + ';
      mixedPrompt += `(${input2}:${percentage2}%)`;
    }
    
    data.mixedOutput = mixedPrompt;
    data.text = mixedPrompt; // Also set as text for chaining
    return mixedPrompt;
  }, [data, mixPercentage]);

  const handleMixChange = useCallback((event) => {
    const newValue = parseInt(event.target.value);
    setMixPercentage(newValue);
    data.mixPercentage = newValue;
  }, [data]);

  // Update output when inputs change
  useEffect(() => {
    buildMixedOutput();
  }, [buildMixedOutput]);



  return (
    <div className="custom-node mix-node">
      <div className="node-content">
        <div className="mix-control">
          <div className="mix-percentage-display">{mixPercentage}% / {100 - mixPercentage}%</div>
          <input
            type="range"
            min="0"
            max="100"
            value={mixPercentage}
            onChange={handleMixChange}
            className="mix-slider"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          />
          <div className="mix-labels">
            <span className="mix-label-left">A</span>
            <span className="mix-label-right">B</span>
          </div>
        </div>

        {(data.input1 || data.input2) && (
          <div className="mix-preview">
            {data.input1 && (
              <div className="mix-input-preview">
                <strong>A ({mixPercentage}%):</strong> {data.input1.substring(0, 30)}{data.input1.length > 30 ? '...' : ''}
              </div>
            )}
            {data.input2 && (
              <div className="mix-input-preview">
                <strong>B ({100 - mixPercentage}%):</strong> {data.input2.substring(0, 30)}{data.input2.length > 30 ? '...' : ''}
              </div>
            )}
          </div>
        )}


      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="input1"
        isConnectable={isConnectable}
        style={{ top: '30%' }}
      />
      <div className="handle-label handle-label-left" style={{ top: '30%' }}>A</div>
      
      <Handle
        type="target"
        position={Position.Left}
        id="input2"
        isConnectable={isConnectable}
        style={{ top: '70%' }}
      />
      <div className="handle-label handle-label-left" style={{ top: '70%' }}>B</div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="text-output"
        isConnectable={isConnectable}
      />
      <div className="handle-label handle-label-right">OUT</div>
    </div>
  );
}

export default MixNode;