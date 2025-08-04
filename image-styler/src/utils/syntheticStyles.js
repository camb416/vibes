// Generate 16 synthetic styles for the application

export const generateSyntheticStyles = () => {
  const syntheticStyles = [
    {
      id: 'neon-cyberpunk-grid',
      title: 'Neon Cyberpunk Grid',
      materials: [
        { type: 'Holographic display', effect: 'Glowing data streams' },
        { type: 'Carbon fiber', finish: 'Matte black with neon accents' }
      ],
      lighting: {
        intensity: 'High contrast',
        source: 'Neon underglow',
        effects: 'Electric blue highlights'
      },
      colorPalette: {
        primary: '#00ffff',
        secondary: '#ff0080',
        background: '#0a0a0a'
      },
      background: {
        type: 'Dark grid pattern',
        mood: 'Futuristic tech'
      },
      moodKeywords: ['Cyberpunk', 'Neon', 'Digital', 'High-tech', 'Electric']
    },
    {
      id: 'crystalline-ice-formation',
      title: 'Crystalline Ice Formation',
      materials: [
        { type: 'Pure ice crystal', texture: 'Sharp angular facets' },
        { type: 'Frozen condensation', effect: 'Delicate frost details' }
      ],
      lighting: {
        intensity: 'Soft diffused',
        source: 'Natural daylight through ice',
        effects: 'Internal light refraction'
      },
      colorPalette: {
        primary: '#e6f7ff',
        secondary: '#b3e0ff',
        accent: '#ffffff'
      },
      background: {
        type: 'Arctic landscape',
        mood: 'Serene and cold'
      },
      moodKeywords: ['Crystal', 'Pure', 'Cold', 'Geometric', 'Natural']
    },
    {
      id: 'volcanic-obsidian-formation',
      title: 'Volcanic Obsidian Formation',
      materials: [
        { type: 'Black volcanic glass', finish: 'Mirror-like surface' },
        { type: 'Flowing lava veins', effect: 'Glowing orange cracks' }
      ],
      lighting: {
        intensity: 'Dramatic',
        source: 'Internal lava glow',
        effects: 'Reflected fire light'
      },
      colorPalette: {
        primary: '#1a1a1a',
        secondary: '#ff4500',
        glow: '#ffaa00'
      },
      background: {
        type: 'Volcanic landscape',
        mood: 'Powerful and primal'
      },
      moodKeywords: ['Volcanic', 'Glass', 'Fire', 'Dramatic', 'Power']
    },
    {
      id: 'bioluminescent-forest',
      title: 'Bioluminescent Forest',
      materials: [
        { type: 'Living fungal growth', effect: 'Natural blue-green glow' },
        { type: 'Translucent mushroom caps', texture: 'Soft organic curves' }
      ],
      lighting: {
        intensity: 'Soft ambient',
        source: 'Bioluminescent organisms',
        effects: 'Gentle pulsing glow'
      },
      colorPalette: {
        primary: '#00ff88',
        secondary: '#0099cc',
        accent: '#44ff00'
      },
      background: {
        type: 'Dark forest',
        mood: 'Mystical and alive'
      },
      moodKeywords: ['Bioluminescent', 'Organic', 'Mystical', 'Living', 'Nature']
    },
    {
      id: 'holographic-chrome-drift',
      title: 'Holographic Chrome Drift',
      materials: [
        { type: 'Liquid chrome', effect: 'Flowing metallic streams' },
        { type: 'Holographic interference', finish: 'Rainbow color shifts' }
      ],
      lighting: {
        intensity: 'Studio bright',
        source: 'Multiple angles',
        effects: 'Spectrum reflection'
      },
      colorPalette: {
        base: '#c0c0c0',
        iridescent: 'full spectrum',
        highlight: '#ffffff'
      },
      background: {
        type: 'Seamless white',
        mood: 'Clean and futuristic'
      },
      moodKeywords: ['Holographic', 'Chrome', 'Fluid', 'Spectrum', 'Premium']
    },
    {
      id: 'ancient-stone-runes',
      title: 'Ancient Stone Runes',
      materials: [
        { type: 'Weathered granite', texture: 'Rough carved surface' },
        { type: 'Glowing rune inscriptions', effect: 'Mystical blue light' }
      ],
      lighting: {
        intensity: 'Mysterious dim',
        source: 'Torch light and rune glow',
        effects: 'Dancing shadows'
      },
      colorPalette: {
        primary: '#8b7d6b',
        secondary: '#4a4a4a',
        glow: '#6699ff'
      },
      background: {
        type: 'Ancient temple',
        mood: 'Mystical and old'
      },
      moodKeywords: ['Ancient', 'Stone', 'Mystical', 'Carved', 'Magical']
    },
    {
      id: 'plasma-energy-core',
      title: 'Plasma Energy Core',
      materials: [
        { type: 'Contained plasma', effect: 'Electric energy streams' },
        { type: 'Magnetic field shell', finish: 'Invisible barrier' }
      ],
      lighting: {
        intensity: 'Intense',
        source: 'Plasma core radiation',
        effects: 'Electric arcs and glow'
      },
      colorPalette: {
        core: '#ff00ff',
        energy: '#00ffff',
        field: '#9900ff'
      },
      background: {
        type: 'Dark laboratory',
        mood: 'Scientific and dangerous'
      },
      moodKeywords: ['Plasma', 'Energy', 'Electric', 'Core', 'Power']
    },
    {
      id: 'coral-reef-formation',
      title: 'Coral Reef Formation', 
      materials: [
        { type: 'Living coral polyps', texture: 'Organic branching growth' },
        { type: 'Calcium carbonate', finish: 'Natural white skeleton' }
      ],
      lighting: {
        intensity: 'Underwater filtered',
        source: 'Sunlight through water',
        effects: 'Caustic light patterns'
      },
      colorPalette: {
        primary: '#ff7f50',
        secondary: '#20b2aa',
        accent: '#ffd700'
      },
      background: {
        type: 'Ocean depths',
        mood: 'Underwater paradise'
      },
      moodKeywords: ['Coral', 'Ocean', 'Living', 'Colorful', 'Natural']
    },
    {
      id: 'quantum-particle-cloud',
      title: 'Quantum Particle Cloud',
      materials: [
        { type: 'Quantum particles', effect: 'Probability wave visualization' },
        { type: 'Energy fields', texture: 'Shimmering distortion' }
      ],
      lighting: {
        intensity: 'Ethereal',
        source: 'Particle interactions',
        effects: 'Quantum interference patterns'
      },
      colorPalette: {
        primary: '#9966ff',
        secondary: '#66ffcc',
        field: '#ff66ff'
      },
      background: {
        type: 'Void space',
        mood: 'Scientific mystery'
      },
      moodKeywords: ['Quantum', 'Particle', 'Science', 'Energy', 'Abstract']
    },
    {
      id: 'desert-sand-sculpture',
      title: 'Desert Sand Sculpture',
      materials: [
        { type: 'Fine desert sand', texture: 'Smooth wind-carved surface' },
        { type: 'Mineral deposits', effect: 'Glittering sparkles' }
      ],
      lighting: {
        intensity: 'Golden hour',
        source: 'Low angle sun',
        effects: 'Long dramatic shadows'
      },
      colorPalette: {
        primary: '#daa520',
        secondary: '#cd853f',
        highlight: '#fff8dc'
      },
      background: {
        type: 'Desert dunes',
        mood: 'Warm and vast'
      },
      moodKeywords: ['Desert', 'Sand', 'Golden', 'Carved', 'Natural']
    },
    {
      id: 'magnetic-ferrofluid',
      title: 'Magnetic Ferrofluid',
      materials: [
        { type: 'Ferromagnetic liquid', effect: 'Spike formations' },
        { type: 'Magnetic field response', texture: 'Dynamic morphing' }
      ],
      lighting: {
        intensity: 'High contrast',
        source: 'Directional spot',
        effects: 'Liquid surface reflections'
      },
      colorPalette: {
        primary: '#2c2c2c',
        secondary: '#000000',
        highlight: '#ffffff'
      },
      background: {
        type: 'Laboratory setting',
        mood: 'Scientific and alien'
      },
      moodKeywords: ['Magnetic', 'Liquid', 'Dynamic', 'Spikes', 'Science']
    },
    {
      id: 'aurora-light-ribbons',
      title: 'Aurora Light Ribbons',
      materials: [
        { type: 'Atmospheric particles', effect: 'Glowing gas interaction' },
        { type: 'Magnetic field lines', texture: 'Flowing ribbon shapes' }
      ],
      lighting: {
        intensity: 'Natural phenomenon',
        source: 'Solar particle interaction',
        effects: 'Dancing colored lights'
      },
      colorPalette: {
        primary: '#00ff7f',
        secondary: '#ff69b4',
        tertiary: '#1e90ff'
      },
      background: {
        type: 'Arctic night sky',
        mood: 'Natural wonder'
      },
      moodKeywords: ['Aurora', 'Natural', 'Flowing', 'Colorful', 'Sky']
    },
    {
      id: 'steampunk-brass-gears',
      title: 'Steampunk Brass Gears',
      materials: [
        { type: 'Aged brass', finish: 'Patinated metal surface' },
        { type: 'Mechanical gears', texture: 'Precise tooth engagement' }
      ],
      lighting: {
        intensity: 'Warm ambient',
        source: 'Gas lamp illumination',
        effects: 'Brass reflections'
      },
      colorPalette: {
        primary: '#b87333',
        secondary: '#cd7f32',
        accent: '#ffd700'
      },
      background: {
        type: 'Victorian workshop',
        mood: 'Industrial nostalgia'
      },
      moodKeywords: ['Steampunk', 'Brass', 'Mechanical', 'Victorian', 'Gears']
    },
    {
      id: 'fractal-crystal-matrix',
      title: 'Fractal Crystal Matrix',
      materials: [
        { type: 'Mathematical crystal', structure: 'Recursive geometric patterns' },
        { type: 'Light interference', effect: 'Rainbow diffraction' }
      ],
      lighting: {
        intensity: 'Precise geometric',
        source: 'Internal crystal structure',
        effects: 'Fractal light patterns'
      },
      colorPalette: {
        base: '#ffffff',
        spectrum: 'full rainbow',
        structure: '#cccccc'
      },
      background: {
        type: 'Infinite recursion',
        mood: 'Mathematical beauty'
      },
      moodKeywords: ['Fractal', 'Crystal', 'Mathematical', 'Geometric', 'Infinite']
    },
    {
      id: 'nebula-gas-cloud',
      title: 'Nebula Gas Cloud',
      materials: [
        { type: 'Stellar gas', density: 'Varying opacity clouds' },
        { type: 'Star formation regions', effect: 'Bright stellar nurseries' }
      ],
      lighting: {
        intensity: 'Cosmic scale',
        source: 'Newborn stars',
        effects: 'Gas illumination'
      },
      colorPalette: {
        primary: '#ff1493',
        secondary: '#00bfff',
        tertiary: '#ffd700'
      },
      background: {
        type: 'Deep space',
        mood: 'Cosmic wonder'
      },
      moodKeywords: ['Nebula', 'Cosmic', 'Gas', 'Stellar', 'Space']
    },
    {
      id: 'liquid-mercury-drops',
      title: 'Liquid Mercury Drops',
      materials: [
        { type: 'Pure mercury', properties: 'Perfect spherical drops' },
        { type: 'Metallic surface', finish: 'Mirror-like reflection' }
      ],
      lighting: {
        intensity: 'Studio lighting',
        source: 'Multiple soft boxes',
        effects: 'Perfect reflections'
      },
      colorPalette: {
        primary: '#c0c0c0',
        reflection: 'environment',
        shadow: '#808080'
      },
      background: {
        type: 'Clean studio',
        mood: 'Scientific precision'
      },
      moodKeywords: ['Mercury', 'Liquid', 'Metallic', 'Drops', 'Precise']
    }
  ];

  return syntheticStyles;
};