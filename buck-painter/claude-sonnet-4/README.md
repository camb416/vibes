# BUCK Painter

A professional 3D vertex painting tool for the web, built with THREE.js.

## Features

### Core Functionality
- **3D Model Painting**: Paint directly on 3D models with your mouse
- **Material System**: Nine predefined materials (Metal, Wood, Plastic, Glass, Fabric, Rubber, Stone, Leather, Ceramic)
- **Brush Controls**: Configurable brush size, strength, and falloff
- **Display Modes**: View all materials, individual materials, or high-visibility testing colors
- **Import/Export**: Load GLTF models and export painted models
- **Default Model**: Built-in humanoid character for immediate use

### Technical Features
- Built with THREE.js for WebGL rendering
- Vertex-based painting system
- Real-time material blending
- Professional user interface
- Responsive design for desktop use
- Compatible with Apple's Reality Composer Pro

## Getting Started

### Prerequisites
- Modern web browser with WebGL support
- Desktop computer with minimum 1920x1080 display
- Python 3 (for local server)

### Installation
1. Clone or download the project files
2. Navigate to the project directory
3. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and navigate to `http://localhost:8000`

### File Structure
```
buck-painter/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js             # Main application logic
├── buck-logo-black-tight.png  # BUCK logo
├── SOFTWARE_REQUIREMENTS.md   # Requirements document
└── README.md          # This file
```

## Usage

### Basic Controls
- **Left Mouse**: Paint with selected material
- **Right Mouse**: Rotate camera (orbit controls)
- **Mouse Wheel**: Zoom in/out
- **Middle Mouse**: Pan camera

### Material System
1. **Select Material**: Click on any material in the palette
2. **Adjust Properties**: Use the brush controls to modify:
   - **Size**: Brush radius (1-50)
   - **Strength**: Paint intensity (0-1)
   - **Falloff**: Edge softness (0-1)

### Display Modes
- **All Materials**: Show all painted materials normally
- **Individual**: Show only the selected material, others appear gray
- **Testing Colors**: Show high-visibility colors for each material type

### File Operations
- **Import GLTF**: Load your own 3D models (.gltf or .glb files)
- **Export**: Save painted models as GLTF files
- **Reset**: Return to the default humanoid model

### Help System
Click the "Help" button in the header for detailed instructions and tips.

## Technical Details

### Architecture
- **Frontend**: Pure HTML, CSS, and JavaScript
- **3D Engine**: THREE.js r128
- **UI Components**: Custom CSS with dat.GUI integration
- **File Format**: GLTF 2.0 for import/export

### Performance
- Optimized for desktop use
- Real-time vertex painting
- Efficient material blending
- Responsive UI updates

### Browser Compatibility
- Chrome 60+ (recommended)
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Code Structure
- `BuckPainter` class: Main application controller
- Three.js scene management
- Custom vertex painting system
- Material palette and brush controls
- Import/export functionality

### Key Components
1. **Scene Setup**: Camera, lights, and renderer configuration
2. **Model Management**: Default model creation and GLTF loading
3. **Painting System**: Raycasting and vertex color manipulation
4. **UI System**: Event handling and user interface
5. **Material System**: Predefined materials and display modes

## Troubleshooting

### Common Issues
1. **Blank Screen**: Check browser console for WebGL errors
2. **Slow Performance**: Reduce brush size or model complexity
3. **Import Issues**: Ensure GLTF files are valid and properly formatted
4. **Missing Logo**: Verify `buck-logo-black-tight.png` is in the project root

### Browser Requirements
- WebGL 2.0 support required
- JavaScript enabled
- Local file access (if running locally)

## License

This project is part of the BUCK development suite.

## Contributing

1. Follow the existing code style
2. Test on multiple browsers
3. Ensure mobile compatibility is maintained
4. Document any new features

## Support

For technical issues or feature requests, please refer to the software requirements document or contact the development team.

---

**BUCK Painter** - Professional 3D Vertex Painting Tool 