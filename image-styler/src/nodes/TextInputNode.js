import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import '../styles/Nodes.css';

function TextInputNode({ data, isConnectable }) {
  const [text, setText] = useState(data.text || '');

  const onChange = useCallback((evt) => {
    setText(evt.target.value);
    data.text = evt.target.value;
    console.log('Text input changed to:', evt.target.value);
  }, [data]);

  return (
    <div className="custom-node text-input-node">
      <div className="node-header">
        <span className="node-icon">📝</span>
        <span className="node-title">Text Input</span>
      </div>
      <div className="node-content">
        <textarea
          value={text}
          onChange={onChange}
          placeholder="Enter your prompt here..."
          className="text-input"
          rows={4}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="text-output"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default TextInputNode;