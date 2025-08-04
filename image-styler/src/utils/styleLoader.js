// Utility functions for loading and managing style presets

export const loadStylePresets = async () => {
  try {
    // In a real app, this would load from the sample-styles folder
    // For now, using the styles we know exist
    const styleFiles = [
      'molten-chrome-liquid-form.json',
      'organic-moss-sculpture.json', 
      'lava-core-resin-glow.json',
      'clear-iridescent-glass-form.json',
      'isometric-multicolor-extrusion-with-grid-control.json'
    ];

    const styles = [];
    
    for (const filename of styleFiles) {
      try {
        const response = await fetch(`/sample-styles/${filename}`);
        if (response.ok) {
          const style = await response.json();
          style.id = filename.replace('.json', '');
          styles.push(style);
        }
      } catch (error) {
        console.warn(`Could not load style: ${filename}`, error);
      }
    }

    // If no styles loaded from files, use fallback data
    if (styles.length === 0) {
      return getFallbackStyles();
    }

    return styles;
  } catch (error) {
    console.error('Error loading style presets:', error);
    return getFallbackStyles();
  }
};

const getFallbackStyles = () => [
  {
    id: 'molten-chrome-liquid-form',
    title: 'Molten Chrome Liquid Form',
    materials: [{ type: 'Liquid metal', finish: 'High gloss chrome' }],
    lighting: { intensity: 'Strong', source: 'Top-front highlight' },
    colorPalette: { baseMetal: '#b0c4de', highlight: '#ffffff' },
    moodKeywords: ['Futuristic', 'Molten', 'Sleek', 'High-tech', 'Luxury']
  },
  {
    id: 'organic-moss-sculpture',
    title: 'Organic Moss Sculpture',
    materials: [{ type: 'Lush moss', description: 'Realistic micro-fiber green moss' }],
    lighting: { intensity: 'Medium', source: 'Overhead soft spot' },
    colorPalette: { primary: '#4d9f3a', shadowTint: '#222222' },
    moodKeywords: ['Natural', 'Eco', 'Tactile', 'Organic', 'Earthy']
  },
  {
    id: 'lava-core-resin-glow',
    title: 'Lava Core Resin Glow',
    materials: [{ type: 'Translucent resin', effect: 'Internal volumetric glow' }],
    lighting: { intensity: 'High inner glow', style: 'Radiating core' },
    colorPalette: { core: '#ff4b00', glow: '#ff6f00' },
    moodKeywords: ['Energy', 'Power', 'Sci-fi', 'Heat', 'Electric']
  },
  {
    id: 'clear-iridescent-glass',
    title: 'Clear Iridescent Glass Form',
    materials: [{ type: 'Crystal clear glass', effect: 'Rainbow prismatic' }],
    lighting: { intensity: 'Bright', source: 'Multi-directional' },
    colorPalette: { base: '#ffffff', iridescent: 'rainbow' },
    moodKeywords: ['Clean', 'Modern', 'Prismatic', 'Light', 'Pure']
  },
  {
    id: 'isometric-multicolor',
    title: 'Isometric Multicolor Extrusion',
    materials: [{ type: 'Matte plastic', finish: 'Geometric blocks' }],
    lighting: { intensity: 'Even', source: 'Technical lighting' },
    colorPalette: { primary: '#ff6b6b', secondary: '#4ecdc4' },
    moodKeywords: ['Geometric', 'Vibrant', 'Technical', 'Structured', 'Bold']
  }
];

export const generateStylePrompt = (style, userPrompt) => {
  const materials = style.materials?.map(m => m.type || m.description).join(', ') || '';
  const lighting = style.lighting ? `${style.lighting.intensity} ${style.lighting.source || ''}`.trim() : '';
  const keywords = style.moodKeywords?.join(', ') || '';
  
  return `Create an image of "${userPrompt}" with the following style:
Materials: ${materials}
Lighting: ${lighting}
Mood: ${keywords}
Background: ${style.background?.type || 'neutral'}
Style: ${style.title}`;
};

export const randomizeStyle = (styles) => {
  if (!styles.length) return null;
  return styles[Math.floor(Math.random() * styles.length)];
};