# Swiss Poster Generator

A web application that generates 16 different Swiss-style poster designs with random images, greeked text, and procedural layouts following Swiss design principles.

## Features

- **16 Unique Designs**: Each page load generates 16 different poster designs with massive variation
- **Print-Ready Formats**: Posters use standard print aspect ratios (8.5×11 letter or 11×17 double spread)
- **Swiss Design Principles**: Clean typography, grid-based layouts, and minimal color palette (black, white, red)
- **Multiple Layout Types**: 
  - Standard layouts with images
  - Type-only designs (50% of posters)
  - Grid-breaking typography
  - Large type/graphic dominant layouts
  - Asymmetrical compositions
  - **NEW: Bold geometric layouts** with massive shapes filling 60%+ of poster
  - **NEW: Split-screen bold designs** with contrasting sections
  - **NEW: Diagonal chaos layouts** with rotated elements and multiple shapes
- **Content Editor**: Dropdown panel to customize title, subtitle, and body text across all posters
- **Geometric Shapes**: Squares, rectangles, triangles, and circles as bold design elements
- **Crazy Daring Designs**: 30% of posters feature bold, experimental layouts
- **Proper Text Layering**: Text always appears in front of graphic elements with proper z-index
- **Variable Typography**: Dynamic font sizes including new 'massive' option for ultra-bold titles
- **Dynamic Red Elements**: Red color applied to different elements (title, subtitle, accent, background, or geometric shapes)
- **Random Images**: Uses placeholder images with different crops and compositions (50% of posters)
- **Greeked Text**: Lorem ipsum-style text with Swiss-themed titles and subtitles
- **Grid View**: Toggle to show alignment grids and margins
- **Export Options**: Export individual posters as SVG, PNG, or directly to Figma (opens automatically)
- **Hot-Reload**: Automatic page refresh when files change during development
- **Responsive Design**: Works on desktop and mobile devices

## Usage

### Quick Start

1. Open `index.html` in your web browser
2. The app will automatically generate 16 unique poster designs
3. Use the "Reload" button to generate new designs
4. Toggle "Grid View" to see layout guidelines  
5. Click "Content Editor" to customize text content across all posters
6. Hover over any poster to see export options
   - **Figma export**: Opens Figma directly with helpful instructions popup

### Controls

- **Reload Button**: Generates 16 new poster designs
- **Grid View Checkbox**: Shows/hides red and blue alignment grids
- **Content Editor**: Dropdown panel with text fields for custom title, subtitle, and body text
- **Export Menu**: Appears on poster hover with format options:
  - **SVG**: Downloads vector file
  - **PNG**: Downloads high-resolution image
  - **Figma**: Opens design directly in Figma (no download needed)

### Keyboard Shortcuts

- `Ctrl/Cmd + R`: Reload posters
- `Ctrl/Cmd + G`: Toggle grid view
- `Escape`: Close export menu

## Development

### Running Locally

#### With Hot-Reload (Recommended)

1. Install dependencies:
```bash
npm install
```

2. Start the development server with hot-reload:
```bash
npm run dev
```

This will automatically:
- Start a local server on http://localhost:8000
- Open the app in your browser
- Watch for file changes and reload automatically

#### Alternative Methods

For development without hot-reload, use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### NPM Scripts

- `npm run dev`: Start development server with hot-reload and file watching
- `npm start`: Start development server (same as dev)
- `npm run serve`: Start basic Python HTTP server (fallback option)

### File Structure

```
swiss-poster-generator/
├── index.html          # Main HTML structure
├── style.css           # CSS styles and Swiss design system
├── script.js           # Main application logic
├── poster-generator.js # Poster generation and layout logic
├── export-handler.js   # Export functionality (SVG, PNG, Figma)
└── README.md          # This file
```

### Architecture

The app is built with vanilla JavaScript and follows a modular class-based architecture:

- **App**: Main application controller
- **PosterGenerator**: Handles poster creation and layout
- **ExportHandler**: Manages export functionality
- **PosterInteraction**: Handles hover effects and interactions
- **PerformanceOptimizer**: Optimizes image loading and performance

### Swiss Design Elements

- **Typography**: Helvetica Neue with uppercase titles and precise letter spacing
- **Grid System**: 4x4 grid layout with consistent spacing and alignment
- **Color Palette**: Black (#000000), White (#ffffff), Red (#ff0000)
- **Layout**: Asymmetrical but balanced compositions
- **Imagery**: Black and white photography with interesting crops
- **Formats**: Standard letter (8.5×11) and double spread (11×17) aspect ratios for print compatibility

### Customization

#### Adding New Themes

Edit the `posterThemes` array in `poster-generator.js`:

```javascript
this.posterThemes = [
    { theme: 'jazz', keywords: ['music', 'instrument', 'concert'] },
    { theme: 'your-theme', keywords: ['keyword1', 'keyword2'] }
];
```

#### Modifying Layouts

Update the `generatePosterLayout()` method in `poster-generator.js` to add new layout variations.

#### Changing Colors

Modify the CSS variables in `style.css` to use different colors while maintaining the Swiss design aesthetic.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance

- Optimized image loading with lazy loading
- Efficient DOM manipulation
- Minimal external dependencies
- Responsive design for all screen sizes

## Export Features

### Figma Integration
- **Direct Figma Opening**: Click Figma export to open design directly in Figma
- **Instruction Popup**: Detailed design specifications appear automatically
- **No Downloads**: Seamless workflow without intermediate files
- **Design Details**: Includes exact dimensions, fonts, colors, and layout information

## License

MIT License - feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Images Not Loading

The app uses placeholder images from picsum.photos. If images don't load:
1. Check your internet connection
2. Try reloading the page
3. Check browser console for errors

### Export Not Working

If export functionality fails:
1. Ensure you're using a modern browser
2. Check that JavaScript is enabled
3. Try a different export format

### Performance Issues

If the app runs slowly:
1. Close other browser tabs
2. Try a different browser
3. Reduce the number of posters by modifying `posterCount` in `poster-generator.js` 