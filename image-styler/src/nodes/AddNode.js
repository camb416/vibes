import React, { useCallback, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import '../styles/Nodes.css';

function AddNode({ data, isConnectable }) {
  const buildConcatenatedOutput = useCallback(() => {
    const inputs = [];
    
    // Collect all available inputs
    if (data.input1) inputs.push(data.input1);
    if (data.input2) inputs.push(data.input2);
    if (data.input3) inputs.push(data.input3);
    
    // Join with spaces
    const output = inputs.join(' ');
    data.concatenatedOutput = output;
    data.text = output; // Also set as text for chaining
    
    return output;
  }, [data]);

  // Update output when inputs change
  useEffect(() => {
    buildConcatenatedOutput();
  }, [buildConcatenatedOutput]);

  return (
    <div className="custom-node add-node">
      <div className="node-header">
        <span className="add-icon">➕</span>
        <span className="add-label">ADD</span>
      </div>
      
      <div className="node-content">
        <div className="add-description">
          Concatenates inputs with spaces
        </div>
        
        {/* Show preview of current inputs */}
        {(data.input1 || data.input2 || data.input3) && (
          <div className="add-preview">
            {data.input1 && <div className="input-preview">A: {data.input1.substring(0, 20)}...</div>}
            {data.input2 && <div className="input-preview">B: {data.input2.substring(0, 20)}...</div>}
            {data.input3 && <div className="input-preview">C: {data.input3.substring(0, 20)}...</div>}
          </div>
        )}
      </div>

      {/* Input handles with clear labels */}
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
        style={{ top: '50%' }}
      />
      <div className="handle-label handle-label-left" style={{ top: '50%' }}>B</div>
      
      <Handle
        type="target"
        position={Position.Left}
        id="input3"
        isConnectable={isConnectable}
        style={{ top: '70%' }}
      />
      <div className="handle-label handle-label-left" style={{ top: '70%' }}>C</div>
      
      {/* Output handle */}
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

export default AddNode;