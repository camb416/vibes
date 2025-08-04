import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { generateImage } from '../utils/openaiApi';
import { getRandomImage } from '../utils/unsplashApi';
import '../styles/Nodes.css';

function ImageNode({ data, isConnectable, selected }) {
  const [isLoading, setIsLoading] = useState(false);

  const { image, isOutput, textInput, styleInput, mixedOutput, styledOutput } = data;

  // Build final prompt with priority: styledOutput > mixedOutput > textInput
  const buildFinalPrompt = useCallback(() => {
    let connectedInput = '';
    
    // Priority order: styledOutput, mixedOutput, then textInput
    if (styledOutput) {
      connectedInput = styledOutput;
    } else if (mixedOutput) {
      connectedInput = mixedOutput;
    } else if (textInput) {
      connectedInput = textInput;
    }

    let finalPrompt = connectedInput;
    
    if (styleInput && styleInput.description) {
      if (finalPrompt) {
        finalPrompt += `, ${styleInput.description}`;
      } else {
        finalPrompt = styleInput.description;
      }
    }
    
    return finalPrompt;
  }, [textInput, styleInput, mixedOutput, styledOutput]);

  const handleGenerate = async () => {
    const finalPrompt = buildFinalPrompt();
    if (!finalPrompt.trim()) {
      alert('Please provide some input text or connect a text/style node.');
      return;
    }

    setIsLoading(true);
    try {
      const imageUrl = await generateImage(finalPrompt);
      data.image = imageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckPrompt = () => {
    const finalPrompt = buildFinalPrompt();
    if (finalPrompt.trim()) {
      alert(`Prompt Preview:\n\n"${finalPrompt}"`);
    } else {
      alert('No prompt available. Please connect text or style inputs.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        data.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomImage = async () => {
    setIsLoading(true);
    try {
      const imageUrl = await getRandomImage();
      data.image = imageUrl;
    } catch (error) {
      console.error('Error fetching random image:', error);
      alert('Failed to fetch random image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOutputMode = () => {
    data.isOutput = !data.isOutput;
  };

  return (
    <>
      {selected && (
        <NodeResizer
          color="#ff0071"
          isVisible={selected}
          minWidth={200}
          minHeight={150}
        />
      )}
      <div className="custom-node image-node">
        <div className="node-header">
          <span>📸</span>
        </div>
        
        <div className="node-content">
          <div className="image-container">
            {image ? (
              <img src={image} alt="Generated" className="node-image" />
            ) : (
              <div className="image-placeholder">
                <span>🖼️</span>
                <p>No image</p>
              </div>
            )}
          </div>

          <div className="image-controls">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id={`file-input-${data.id || Math.random()}`}
            />
            <button
              onClick={() => document.getElementById(`file-input-${data.id || Math.random()}`).click()}
              className="control-btn"
              disabled={isLoading}
            >
              Upload
            </button>
            <button
              onClick={handleRandomImage}
              className="control-btn"
              disabled={isLoading}
            >
              Random
            </button>
            <button
              onClick={toggleOutputMode}
              className={`control-btn ${isOutput ? 'active' : ''}`}
            >
              {isOutput ? 'Output' : 'Input'}
            </button>
          </div>

          {isOutput && (
            <div className="image-icon-controls">
              <button 
                className="icon-btn check-prompt-icon"
                onClick={handleCheckPrompt}
                disabled={isLoading}
                title="Check Prompt"
              >
                ?
              </button>
              <button 
                className="icon-btn generate-icon"
                onClick={handleGenerate}
                disabled={isLoading}
                title={isLoading ? 'Generating...' : 'Generate Image'}
              >
                {isLoading ? '⏳' : '✈️'}
              </button>
            </div>
          )}
        </div>

        {/* Input handle - visible if output mode AND no image loaded */}
        {isOutput && !image && (
          <Handle
            type="target"
            position={Position.Left}
            id="text-input"
            isConnectable={isConnectable}
          />
        )}

        {/* Style input handle for output nodes */}
        {isOutput && (
          <Handle
            type="target"
            position={Position.Left}
            id="style-input"
            isConnectable={isConnectable}
            style={{ top: '70%' }}
          />
        )}

        {!isOutput && (
          <Handle
            type="source"
            position={Position.Right}
            id="image-output"
            isConnectable={isConnectable}
          />
        )}
      </div>
    </>
  );
}

export default ImageNode;