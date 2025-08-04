import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';


import TextInputNode from './nodes/TextInputNode';
import ImageNode from './nodes/ImageNode';
import StyleNode from './nodes/StyleNode';
import MyStyleNode from './nodes/MyStyleNode';
import MixNode from './nodes/MixNode';
import AddNode from './nodes/AddNode';
import SettingsPanel from './components/SettingsPanel';

import './styles/App.css';

const nodeTypes = {
  textInput: TextInputNode,
  image: ImageNode,
  style: StyleNode,
  myStyle: MyStyleNode,
  mix: MixNode,
  add: AddNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'textInput',
    position: { x: 100, y: 100 },
    data: { label: 'Text Input' },
  },
];

const initialEdges = [];

// Utility function to generate unique IDs
let id = 0;
const getId = () => `dndnode_${id++}`;

// Utility function to get initial node data based on type
const getInitialNodeData = (type) => {
  switch (type) {
    case 'textInput':
      return { text: '', label: 'Text Input' };
    case 'image':
      return { image: null, isOutput: true, label: 'Image' };
    case 'style':
      return { selectedStyle: '', styleData: null, label: 'Style' };
    case 'myStyle':
      return { 
        customStyle: {
          title: '',
          materials: [{ type: '', description: '' }],
          lighting: { intensity: '', source: '', effects: '' },
          colorPalette: { primary: '#000000', secondary: '#ffffff' },
          background: { type: '', mood: '' },
          moodKeywords: []
        }, 
        label: 'My Style' 
      };
    case 'mix':
      return { mixPercentage: 50, input1: '', input2: '', mixedOutput: '', label: 'Mix' };
    case 'add':
      return { input1: '', input2: '', input3: '', concatenatedOutput: '', label: 'Add' };
    default:
      return { label: `${type} node` };
  }
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [openAIKey, setOpenAIKey] = useState(localStorage.getItem('openai_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [pendingConnection, setPendingConnection] = useState(null);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Handle Alt key for copying nodes
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey) {
        setIsAltPressed(true);
        // Change cursor to indicate copy mode
        document.body.style.cursor = 'copy';
      }
    };

    const handleKeyUp = (event) => {
      if (!event.altKey) {
        setIsAltPressed(false);
        // Reset cursor
        document.body.style.cursor = 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // Reset cursor on cleanup
      document.body.style.cursor = 'default';
    };
  }, []);

  // Function to get connected node data
  const getConnectedNodeData = useCallback((nodeId, handleId) => {
    const connection = edges.find(edge => 
      edge.target === nodeId && edge.targetHandle === handleId
    );
    if (connection) {
      const sourceNode = nodes.find(n => n.id === connection.source);
      return sourceNode?.data;
    }
    return null;
  }, [nodes, edges]);

  // Update node data when connections change
  useEffect(() => {
    const updateConnectedData = () => {
      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          const newData = { ...node.data };
          let updated = false;

          // Update connected inputs - support chaining
          const textConnection = edges.find(edge => 
            edge.target === node.id && edge.targetHandle === 'text-input'
          );
          if (textConnection) {
            const sourceNode = currentNodes.find(n => n.id === textConnection.source);
            const sourceText = sourceNode?.data?.styledOutput || sourceNode?.data?.mixedOutput || sourceNode?.data?.text || '';
            if (sourceText !== newData.textInput) {
              console.log(`Updating ${node.id} textInput from ${newData.textInput} to ${sourceText}`);
              newData.textInput = sourceText;
              updated = true;
            }
          }

          // Update mix node inputs
          const input1Connection = edges.find(edge => 
            edge.target === node.id && edge.targetHandle === 'input1'
          );
          if (input1Connection) {
            const sourceNode = currentNodes.find(n => n.id === input1Connection.source);
            const sourceText = sourceNode?.data?.styledOutput || sourceNode?.data?.mixedOutput || sourceNode?.data?.text || '';
            if (sourceText !== newData.input1) {
              newData.input1 = sourceText;
              updated = true;
            }
          }

          const input2Connection = edges.find(edge => 
            edge.target === node.id && edge.targetHandle === 'input2'
          );
          if (input2Connection) {
            const sourceNode = currentNodes.find(n => n.id === input2Connection.source);
            const sourceText = sourceNode?.data?.styledOutput || sourceNode?.data?.mixedOutput || sourceNode?.data?.text || '';
            if (sourceText !== newData.input2) {
              newData.input2 = sourceText;
              updated = true;
            }
          }

          const input3Connection = edges.find(edge => 
            edge.target === node.id && edge.targetHandle === 'input3'
          );
          if (input3Connection) {
            const sourceNode = currentNodes.find(n => n.id === input3Connection.source);
            const sourceText = sourceNode?.data?.styledOutput || sourceNode?.data?.mixedOutput || sourceNode?.data?.text || '';
            if (sourceText !== newData.input3) {
              newData.input3 = sourceText;
              updated = true;
            }
          }

          const styleConnection = edges.find(edge => 
            edge.target === node.id && edge.targetHandle === 'style-input'
          );
          if (styleConnection) {
            const sourceNode = currentNodes.find(n => n.id === styleConnection.source);
            const sourceStyleData = sourceNode?.data?.styleData || sourceNode?.data?.customStyle;
            if (sourceStyleData && sourceStyleData !== newData.styleInput) {
              newData.styleInput = sourceStyleData;
              updated = true;
            }
          }

          const imageConnection = edges.find(edge => 
            edge.target === node.id && edge.targetHandle === 'image-input'
          );
          if (imageConnection) {
            const sourceNode = currentNodes.find(n => n.id === imageConnection.source);
            if (sourceNode?.data?.image !== newData.imageInput) {
              newData.imageInput = sourceNode?.data?.image || null;
              updated = true;
            }
          }

          return updated ? { ...node, data: newData } : node;
        });
      });
    };

    // Debounce the update to prevent excessive re-renders
    const timeoutId = setTimeout(updateConnectedData, 100);
    return () => clearTimeout(timeoutId);
  }, [edges, nodes]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
    // Update node data connections
    updateNodeConnections(params);
  }, []);

  // Handle node drag start - check for Alt key to enable copying
  const onNodeDragStart = useCallback((event, node) => {
    if (isAltPressed) {
      // Create a deep copy of the node data
      const copyNodeData = (data) => {
        if (data.customStyle) {
          // Deep copy custom style object
          return {
            ...data,
            customStyle: {
              ...data.customStyle,
              materials: data.customStyle.materials ? [...data.customStyle.materials.map(m => ({...m}))] : [],
              lighting: data.customStyle.lighting ? {...data.customStyle.lighting} : {},
              colorPalette: data.customStyle.colorPalette ? {...data.customStyle.colorPalette} : {},
              background: data.customStyle.background ? {...data.customStyle.background} : {},
              moodKeywords: data.customStyle.moodKeywords ? [...data.customStyle.moodKeywords] : []
            },
            // Reset connection data for the copy
            textInputNodeId: undefined,
            styleInputNodeId: undefined,
            imageInputNodeId: undefined,
            input1NodeId: undefined,
            input2NodeId: undefined,
            textInput: '',
            styleInput: null,
            mixedOutput: '',
            styledOutput: ''
          };
        }
        
        // For other node types, just copy the data and reset connections
        return {
          ...data,
          textInputNodeId: undefined,
          styleInputNodeId: undefined,
          imageInputNodeId: undefined,
          input1NodeId: undefined,
          input2NodeId: undefined,
          input3NodeId: undefined,
          textInput: '',
          styleInput: null,
          mixedOutput: '',
          styledOutput: '',
          concatenatedOutput: ''
        };
      };

      // Create a copy of the node
      const copiedNode = {
        ...node,
        id: getId(),
        position: {
          x: node.position.x + 20,
          y: node.position.y + 20
        },
        data: copyNodeData(node.data),
        selected: false
      };

      // Add the copied node
      setNodes((nds) => [...nds, copiedNode]);
      
      console.log('Node copied:', copiedNode);
    }
  }, [isAltPressed]);

  const updateNodeConnections = useCallback((connection) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === connection.target) {
          // Update target node with source data
          const sourceNode = nds.find(n => n.id === connection.source);
          const newData = { ...node.data };
          
          console.log('Updating connection:', {
            source: connection.source,
            target: connection.target,
            targetHandle: connection.targetHandle,
            sourceData: sourceNode?.data
          });
          
          // Map connection handles to data - support chaining
          if (connection.targetHandle === 'text-input') {
            // Accept text from various sources in priority order
            const sourceText = sourceNode?.data?.styledOutput || sourceNode?.data?.mixedOutput || sourceNode?.data?.text || '';
            newData.textInput = sourceText;
            newData.textInputNodeId = connection.source;
            console.log('Set textInput to:', sourceText);
          } else if (connection.targetHandle === 'style-input') {
            newData.styleInput = sourceNode?.data?.styleData || sourceNode?.data?.customStyle || null;
            newData.styleInputNodeId = connection.source;
            console.log('Set styleInput to:', newData.styleInput);
          } else if (connection.targetHandle === 'image-input') {
            newData.imageInput = sourceNode?.data?.image || null;
            newData.imageInputNodeId = connection.source;
          } else if (connection.targetHandle === 'input1') {
            const sourceText = sourceNode?.data?.styledOutput || sourceNode?.data?.mixedOutput || sourceNode?.data?.text || '';
            newData.input1 = sourceText;
            newData.input1NodeId = connection.source;
          } else if (connection.targetHandle === 'input2') {
            const sourceText = sourceNode?.data?.styledOutput || sourceNode?.data?.mixedOutput || sourceNode?.data?.text || '';
            newData.input2 = sourceText;
            newData.input2NodeId = connection.source;
          } else if (connection.targetHandle === 'input3') {
            const sourceText = sourceNode?.data?.styledOutput || sourceNode?.data?.mixedOutput || sourceNode?.data?.text || '';
            newData.input3 = sourceText;
            newData.input3NodeId = connection.source;
          }
          
          return { ...node, data: newData };
        }
        return node;
      })
    );
  }, []);



  const createNode = useCallback((type, position) => {
    const newNode = {
      id: getId(),
      type,
      position,
      data: getInitialNodeData(type),
    };
    setNodes((nds) => nds.concat(newNode));
    return newNode;
  }, []);

  const handleCanvasClick = useCallback((event) => {
    if (event.target.classList.contains('react-flow__pane')) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      
      setContextMenu({
        show: true,
        x: event.clientX,
        y: event.clientY,
        position
      });
    }
  }, [reactFlowInstance]);

  const handleAddNode = useCallback((type) => {
    if (contextMenu.position) {
      const newNode = createNode(type, contextMenu.position);
      
      // If we have a pending connection, connect it
      if (pendingConnection) {
        const newConnection = {
          id: `${pendingConnection.source}-${newNode.id}`,
          source: pendingConnection.source,
          target: newNode.id,
          targetHandle: getDefaultTargetHandle(type),
          sourceHandle: pendingConnection.sourceHandle,
        };
        setEdges((eds) => addEdge(newConnection, eds));
        setPendingConnection(null);
      }
    }
    setContextMenu({ show: false, x: 0, y: 0 });
  }, [contextMenu.position, pendingConnection, createNode]);

  const getDefaultTargetHandle = (nodeType) => {
    switch (nodeType) {
      case 'image': return 'text-input';
      case 'style': return 'text-input'; 
      case 'myStyle': return 'text-input';
      case 'mix': return 'input1';
      case 'add': return 'input1';
      default: return 'text-input';
    }
  };

  const onConnectStart = useCallback((_, { nodeId, handleId }) => {
    setPendingConnection({ source: nodeId, sourceHandle: handleId });
  }, []);

  const onConnectEnd = useCallback((event) => {
    const target = event.target || event.srcElement;
    if (target && target.classList && target.classList.contains('react-flow__pane')) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      
      setContextMenu({
        show: true,
        x: event.clientX,
        y: event.clientY,
        position
      });
    } else {
      setPendingConnection(null);
    }
  }, [reactFlowInstance]);

  const onRandomize = useCallback(async () => {
    // Import utilities
    const { generateSyntheticStyles } = await import('./utils/syntheticStyles');
    const { getRandomImage } = await import('./utils/unsplashApi');
    
    const allStyles = generateSyntheticStyles();
    
    setNodes((nds) =>
      nds.map((node) => {
        const newData = { ...node.data };
        
        switch (node.type) {
          case 'textInput':
            const randomPrompts = [
              'a majestic dragon soaring through clouds',
              'a futuristic city at sunset',
              'a magical forest with glowing mushrooms',
              'an abstract geometric sculpture',
              'a vintage steam locomotive',
              'a crystal cave with rainbow light',
              'a robotic cat in a neon alley',
              'a floating island with waterfalls'
            ];
            newData.text = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
            break;
            
          case 'style':
          case 'myStyle':
            const randomStyle = allStyles[Math.floor(Math.random() * allStyles.length)];
            newData.selectedStyle = randomStyle.id;
            newData.styleData = randomStyle;
            break;
            
          case 'image':
            if (!node.data.isOutput) {
              // For input images, load a random image
              getRandomImage(400, 300).then(url => {
                setNodes(currentNodes => 
                  currentNodes.map(n => 
                    n.id === node.id 
                      ? { ...n, data: { ...n.data, image: url } }
                      : n
                  )
                );
              });
            }
            break;
            

            
          case 'mix':
            newData.mixPercentage = Math.floor(Math.random() * 101);
            break;
            
          case 'add':
            // No specific randomization needed for add nodes
            break;
            
          default:
            break;
        }
        
        return {
          ...node,
          data: {
            ...newData,
            randomized: Math.random(),
          },
        };
      })
    );
  }, [setNodes]);

  const nodeTypes_list = [
    { type: 'textInput', label: 'Text Input', icon: '📝', description: 'Enter text prompts' },
    { type: 'image', label: 'Image', icon: '🖼️', description: 'Input/Output images' },
    { type: 'style', label: 'Style Preset', icon: '🎨', description: 'Apply style presets' },
    { type: 'myStyle', label: 'My Style', icon: '✨', description: 'Custom style creator' },
    { type: 'mix', label: 'Mix', icon: '🎛️', description: 'Blend two inputs with adjustable ratio' },
    { type: 'add', label: 'Add', icon: '➕', description: 'Concatenate text prompts with spaces' },
  ];

  const proOptions = {
    hideAttribution: true,
  };

  return (
    <div className="app">
      <div className="main-content">
        <div className="top-bar">
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
        <div className={`reactflow-wrapper ${isAltPressed ? 'copy-mode' : ''}`} ref={reactFlowWrapper}>
          {isAltPressed && (
            <div className="copy-hint">
              📋 Copy Mode: Drag any node to duplicate it
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onInit={setReactFlowInstance}
            onPaneClick={handleCanvasClick}
            onNodeDragStart={onNodeDragStart}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            proOptions={proOptions}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={20} size={1} />
          </ReactFlow>
        </div>
      </div>
      
      {contextMenu.show && (
        <div 
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="context-menu-header">Add Node</div>
          {nodeTypes_list.map((nodeType) => (
            <button
              key={nodeType.type}
              className="context-menu-item"
              onClick={() => handleAddNode(nodeType.type)}
            >
              <span className="context-menu-icon">{nodeType.icon}</span>
              <span className="context-menu-label">{nodeType.label}</span>
              <span className="context-menu-desc">{nodeType.description}</span>
            </button>
          ))}
        </div>
      )}
      
      {contextMenu.show && (
        <div 
          className="context-menu-backdrop"
          onClick={() => {
            setContextMenu({ show: false, x: 0, y: 0 });
            setPendingConnection(null);
          }}
        />
      )}
      
      {showSettings && (
        <SettingsPanel
          openAIKey={openAIKey}
          setOpenAIKey={setOpenAIKey}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;