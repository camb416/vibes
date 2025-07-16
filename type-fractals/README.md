# Type Fractals

A web app that generates complex fractal patterns from typography. Transform letters into beautiful, intricate geometric structures with Swiss-inspired design.

## Features

- **4 Fractal Algorithms**: Recursive Division, Spiral Transform, Tree Branching, and Geometric Tiling
- **Variable Fonts**: Inter, Space Grotesk, and JetBrains Mono with full weight ranges
- **Color Palettes**: Mono, Warm, Cool, and Neon palettes optimized for readability
- **Export**: High-resolution PNG export with metadata
- **Permalinks**: Shareable URLs with seed-based regeneration
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Open `index.html`** in a modern web browser
2. **Enter text** (1-5 characters work best)
3. **Choose a font** from the dropdown
4. **Select an algorithm** for different fractal styles
5. **Adjust iterations** (1-8) for complexity
6. **Pick a color palette** 
7. **Click "GENERATE"** or use the **"I'M FEELING LUCKY"** button

## Controls

- **Generate**: Create fractal with current settings
- **Stop**: Interrupt current generation immediately
- **I'm Feeling Lucky**: Random text, font, algorithm, iterations, palette, and seed
- **Export PNG**: Save as high-resolution PNG with metadata
- **Seed Display**: Shows current seed for reproducible results

## Keyboard Shortcuts

- **Space**: Generate new fractal (or stop if currently generating)
- **Escape**: Stop current generation
- **Ctrl+L**: I'm Feeling Lucky
- **Ctrl+S**: Export PNG

## Algorithms

### Recursive Division
Creates nested, self-similar patterns by recursively dividing and scaling the typography.

### Spiral Transform
Arranges text in golden spiral patterns with rotation and scaling.

### Tree Branching
Generates organic branching structures using the text as nodes.

### Geometric Tiling
Creates regular geometric patterns with transformed typography.

## Technical Details

- **Performance**: Optimized for 60fps on M1 Pro and better
- **Resolution**: Exports at 2048x2048 for print quality
- **Rendering**: Canvas 2D with crisp pixel rendering
- **Fonts**: Variable weight fonts loaded from Google Fonts
- **Permalinks**: URL parameters preserve exact settings

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## File Structure

```
type-fractals/
├── index.html          # Main HTML structure
├── style.css           # Swiss design styling
├── script.js           # Main application logic
├── fractals.js         # Fractal generation algorithms
├── export.js           # PNG export functionality
└── README.md           # This file
```

## Development

The app is built with vanilla JavaScript, HTML5 Canvas, and CSS. No build process required - just open `index.html` in your browser.

## License

Open source - feel free to modify and use as needed. 