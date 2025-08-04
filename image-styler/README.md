# Image Styler

A powerful node-based visual editor for creating AI-generated images with custom styling presets.

## Features

- **Node-Based Interface**: Drag and drop nodes to create complex image generation workflows
- **AI Image Generation**: Powered by OpenAI's DALL-E 3 API for high-quality image generation
- **Style Presets**: Choose from 21 unique style presets (5 sample + 16 synthetic)
- **Custom Styles**: Create your own style definitions with materials, lighting, and mood keywords
- **Batch Generation**: Generate multiple image variations at once
- **Random Images**: Get random placeholder images for testing
- **"I'm Feeling Lucky"**: Randomize all node settings for creative inspiration
- **Local Storage**: Your OpenAI API key is stored securely in your browser

## Node Types

### 📝 Text Input
Enter text prompts that describe what you want to generate.

### 🖼️ Image
- **Input Mode**: Upload images or get random web images
- **Output Mode**: Generate images using connected text and style inputs

### 🎨 Style Preset
Apply pre-defined styles from our collection:
- Molten Chrome Liquid Form
- Organic Moss Sculpture  
- Lava Core Resin Glow
- Clear Iridescent Glass Form
- Neon Cyberpunk Grid
- Crystalline Ice Formation
- And 15 more...

### ✨ My Style
Create custom styles by defining:
- Materials and textures
- Lighting conditions
- Color palettes
- Mood keywords

### 📚 Image Batch
Generate 2-8 image variations using connected inputs.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Set Up OpenAI API Key**:
   - Click the settings icon (⚙️) in the sidebar
   - Enter your OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))
   - Your key is stored locally and never sent to our servers

4. **Create Your First Workflow**:
   - Drag a "Text Input" node to the canvas
   - Add an "Image" node and set it to "Output" mode
   - Connect the text output to the image input
   - Click "Generate" to create your image!

## Usage Tips

- **Connect Nodes**: Drag from output handles (right side) to input handles (left side)
- **Use Style Nodes**: Connect style outputs to image inputs for styled generation
- **Try "Lucky" Button**: Randomizes all node settings for creative inspiration
- **Batch Processing**: Use Image Batch nodes for multiple variations
- **Custom Styles**: Experiment with My Style nodes for unique aesthetics

## Architecture

- **Frontend**: React with React Flow for the node editor
- **Styling**: CSS3 with gradient themes
- **APIs**: OpenAI DALL-E 3 for image generation, Unsplash for stock images
- **Storage**: LocalStorage for settings and API keys

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm start

# Build for production
npm build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.