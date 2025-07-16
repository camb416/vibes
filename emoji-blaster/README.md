# EMOJI BLASTER

A high-performance, interactive web application that creates explosive emoji effects with sophisticated physics. Optimized for smooth 30+ FPS performance on mid-range hardware. Click or tap anywhere to blast emoji across the screen!

## ✨ Features

### Core Functionality
- **Explosive Emoji Effects**: Click or tap anywhere to create an explosion of emoji particles
- **Sophisticated Physics**: Realistic gravity, bouncing, friction, and collision detection
- **Dynamic Splatting**: Emoji splat against walls and tumble to the ground with splash effects
- **Performance Optimized**: Maintains 30+ FPS on mid-range hardware with intelligent particle management
- **Minimal UI**: Clean, monospaced black and white interface focused on the canvas

### Interactive Controls
- **Mouse/Touch Support**: Works on desktop and mobile devices
- **Auto Mode**: Automated emoji explosions at optimized intervals
- **Emoji Themes**: Choose from various emoji sets (Party, Hearts, Stars, etc.)
- **Keyboard Shortcuts**: 
  - `Space`: Create explosion at center
  - `C`: Clear all particles
  - `A`: Toggle auto mode
  - `E`: Export current canvas

### Visual Effects
- **Large Canvas**: 1400x800 pixel canvas for maximum visual impact
- **Particle System**: Up to 300 particles with individual physics and automatic cleanup
- **Rotation & Scaling**: Emoji rotate and scale naturally as they move
- **Fade Effects**: Particles gradually fade out over time
- **Performance Stats**: Real-time FPS and particle count display in monospace font

### Export Capabilities
- **PNG Export**: Download the current canvas as a high-quality PNG image
- **Vector-Ready**: Clean, scalable output suitable for printing

## 🚀 How to Run

### Development Mode (Recommended)
For active development with hot-reloading:

```bash
# First time setup
npm run setup

# Start development server with hot reload
npm run dev
```

The server will automatically open your browser to `http://localhost:3000` and reload when you make changes to any file.

### Production Build
To create an optimized production build:

```bash
# Build for production
npm run build
```

This creates a `dist/` folder with minified CSS and cache-busting for deployment.

### Direct Browser Opening
1. Simply open `index.html` in any modern web browser
2. No server required - runs entirely in the browser!

## 🎮 How to Use

1. **Basic Interaction**: Click or tap anywhere on the canvas to create an emoji explosion
2. **Auto Mode**: Click the "🤖 Auto Mode" button to enable automatic explosions
3. **Choose Emoji**: Select different emoji themes from the dropdown menu
4. **Clear Screen**: Use the "🧹 Clear" button to remove all particles
5. **Export**: Click "📸 Export Image" to download your creation as a PNG

## 🛠️ Technical Details

### Technologies Used
- **P5.js**: Creative coding library for graphics and interaction
- **Vanilla JavaScript**: No heavy frameworks, keeping it lightweight
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **HTML5**: Clean, semantic structure

### Development Features
- **Hot Reload**: Automatic browser refresh when files change
- **Custom Dev Server**: Built-in development server with file watching
- **Production Build**: Optimized dist folder with minification and cache busting
- **No External Dependencies**: Development server uses only Node.js built-ins

### Physics Implementation
- **Gravity System**: Realistic downward acceleration
- **Collision Detection**: Boundary checking for walls and floor
- **Bounce Physics**: Configurable bounce coefficients
- **Friction**: Air resistance and ground friction effects
- **Particle Lifecycle**: Automatic cleanup and memory management

### Performance Optimization
- **Efficient Particle Management**: Automatic removal of dead particles with 300 particle limit
- **Optimized Rendering**: Simplified emoji rendering without expensive effects
- **Intelligent Particle Creation**: Fewer splash particles and reduced explosion sizes
- **Performance Monitoring**: Real-time FPS tracking to maintain 30+ FPS
- **Responsive Design**: Adapts to different screen sizes up to 1400px wide
- **Memory Management**: Efficient particle lifecycle and cleanup

## 🌟 Future Features (Planned)

As outlined in the requirements, future enhancements will include:
- **GIF Export**: Ability to record and export animated GIFs of the emoji explosions
- **More Particle Effects**: Additional visual effects like sparkles, smoke, etc.
- **Sound Effects**: Audio feedback for explosions and impacts
- **Customizable Physics**: User controls for gravity, bounce, and other physics parameters

## 📱 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 16+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

The app is designed to be easily customizable:
- **Emoji Sets**: Add new emoji collections in the `emojiSets` object
- **Physics Parameters**: Adjust gravity, bounce, friction in the `EmojiParticle` class
- **Visual Effects**: Modify colors, sizes, and animations in the drawing functions
- **UI Theme**: Update the CSS for different visual themes

## 🔧 File Structure

```
emoji-blaster/
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # P5.js application logic
├── package.json        # Node.js project configuration
├── dev-server.js       # Development server with hot reload
├── build.js            # Production build script
├── .gitignore          # Git ignore patterns
├── README.md           # This file
├── REQUIREMENTS.md     # Original project requirements
└── dist/               # Production build output (generated)
```

## 🎯 Performance Features

- **Particle Limit**: Automatically caps at 80 particles to maintain performance
- **Intelligent Cleanup**: Particles fade out faster and are removed efficiently
- **Splash Control**: Prevents excessive splash effects that slow down performance
- **Optimized Auto Mode**: 1.5-second intervals instead of 1-second for better performance
- **Simplified Rendering**: Removed expensive glow and trail effects for 30+ FPS
- **Large Canvas**: 1400x800 pixels for maximum visual impact without performance loss
- **Hardware Optimized**: Tested to run smoothly on mid-range MacBook Pro with integrated graphics

---

**Have fun blasting emoji! 🎉** 