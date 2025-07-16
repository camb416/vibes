class TypeFractalApp {
    constructor() {
        this.canvas = document.getElementById('fractal-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.fractalGenerator = new FractalGenerator(this.canvas, this.ctx);
        this.exportManager = new ExportManager(this.canvas);
        this.currentSettings = {
            text: 'A',
            font: 'Inter',
            weight: 700,
            algorithm: 'recursive',
            iterations: 4,
            palette: 'mono',
            seed: 123456
        };
        this.isGenerating = false;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadFromURL();
        this.generateInitialFractal();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const controlsPanel = document.querySelector('.controls-panel');
            const controlsWidth = window.innerWidth <= 768 ? 0 : controlsPanel.offsetWidth;
            
            // Set canvas size to match display size exactly (1:1 pixel ratio)
            const displayWidth = window.innerWidth - controlsWidth;
            const displayHeight = window.innerHeight;
            
            // Set canvas size and style size to be identical (no scaling)
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.canvas.style.width = displayWidth + 'px';
            this.canvas.style.height = displayHeight + 'px';
            
            // Update fractal generator dimensions
            this.fractalGenerator.width = displayWidth;
            this.fractalGenerator.height = displayHeight;
            this.fractalGenerator.centerX = displayWidth / 2;
            this.fractalGenerator.centerY = displayHeight / 2;
            
            // Re-generate if we have current settings
            if (this.currentSettings.seed && !this.isGenerating) {
                this.generateFractal();
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    setupEventListeners() {
        // Text input
        const textInput = document.getElementById('text-input');
        textInput.addEventListener('input', (e) => {
            this.stopGeneration();
            this.currentSettings.text = e.target.value || 'A';
            this.debounceGenerate();
        });

        // Font select
        const fontSelect = document.getElementById('font-select');
        fontSelect.addEventListener('change', (e) => {
            this.stopGeneration();
            this.currentSettings.font = e.target.value;
            this.generateFractal();
        });

        // Font weight select
        const weightSelect = document.getElementById('weight-select');
        weightSelect.addEventListener('change', (e) => {
            this.stopGeneration();
            this.currentSettings.weight = parseInt(e.target.value);
            this.generateFractal();
        });

        // Algorithm select
        const algorithmSelect = document.getElementById('algorithm-select');
        algorithmSelect.addEventListener('change', (e) => {
            this.stopGeneration();
            this.currentSettings.algorithm = e.target.value;
            this.generateFractal();
        });

        // Iterations slider
        const iterationsSlider = document.getElementById('iterations-slider');
        const iterationsValue = document.getElementById('iterations-value');
        iterationsSlider.addEventListener('input', (e) => {
            this.stopGeneration();
            const value = parseInt(e.target.value);
            this.currentSettings.iterations = value;
            iterationsValue.textContent = value;
            this.debounceGenerate();
        });

        // Palette selection
        const paletteOptions = document.querySelectorAll('.palette-option');
        paletteOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.stopGeneration();
                paletteOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.currentSettings.palette = option.dataset.palette;
                this.fractalGenerator.setColorPalette(this.currentSettings.palette);
                this.generateFractal();
            });
        });

        // Generate button
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.addEventListener('click', () => {
            this.stopGeneration();
            this.generateFractal();
        });

        // I'm Feeling Lucky button
        const luckyBtn = document.getElementById('lucky-btn');
        luckyBtn.addEventListener('click', () => {
            this.stopGeneration();
            this.generateLucky();
        });

        // Export button
        const exportBtn = document.getElementById('export-btn');
        exportBtn.addEventListener('click', () => {
            this.exportFractal();
        });

        // Stop button
        const stopBtn = document.getElementById('stop-btn');
        stopBtn.addEventListener('click', () => {
            this.stopGeneration();
        });

        // General click handler for controls panel - stop generation on any interaction
        const controlsPanel = document.querySelector('.controls-panel');
        controlsPanel.addEventListener('click', (e) => {
            // Only stop if clicking on interactive elements
            if (e.target.matches('input, select, button, .palette-option') || 
                e.target.closest('.palette-option')) {
                this.stopGeneration();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                if (this.isGenerating) {
                    this.stopGeneration();
                } else {
                    this.generateFractal();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.stopGeneration();
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                this.generateLucky();
            } else if (e.key === 's' && e.ctrlKey) {
                e.preventDefault();
                this.exportFractal();
            }
        });
    }

    generateFractal(newSeed = null) {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        this.showLoading();
        this.updateButtonStates();
        
        if (newSeed) {
            this.currentSettings.seed = newSeed;
        }
        
        // Update seed display
        document.getElementById('current-seed').textContent = this.currentSettings.seed.toString().padStart(6, '0');
        
        // Update URL
        this.updateURL();
        
        // Show loading briefly, then hide before drawing starts
        setTimeout(() => {
            this.hideLoading();
            
                            // Start drawing after loading screen is hidden
                setTimeout(() => {
                    try {
                        const { text, font, weight, algorithm, iterations, palette, seed } = this.currentSettings;
                        
                        this.fractalGenerator.setColorPalette(palette);
                        
                        const onComplete = () => {
                            this.isGenerating = false;
                            this.updateButtonStates();
                        };
                        
                        switch (algorithm) {
                            case 'recursive':
                                this.fractalGenerator.generateRecursive(text, font, iterations, seed, onComplete, weight);
                                break;
                            case 'spiral':
                                this.fractalGenerator.generateSpiral(text, font, iterations * 20, seed, onComplete, weight);
                                break;
                            case 'tree':
                                this.fractalGenerator.generateTree(text, font, iterations, seed, onComplete, weight);
                                break;
                            case 'geometric':
                                this.fractalGenerator.generateGeometric(text, font, iterations, seed, onComplete, weight);
                                break;
                            default:
                                this.fractalGenerator.generateRecursive(text, font, iterations, seed, onComplete, weight);
                        }
                        
                    } catch (error) {
                        console.error('Generation failed:', error);
                        this.isGenerating = false;
                        this.updateButtonStates();
                    }
                }, 50);
        }, 500);
    }

    generateLucky() {
        // Random text
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
        const length = 1 + Math.floor(Math.random() * 3);
        let randomText = '';
        for (let i = 0; i < length; i++) {
            randomText += chars[Math.floor(Math.random() * chars.length)];
        }
        
        // Random font
        const fonts = ['Inter', 'Space Grotesk', 'JetBrains Mono'];
        const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
        
        // Random algorithm
        const algorithms = ['recursive', 'spiral', 'tree', 'geometric'];
        const randomAlgorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
        
        // Random iterations
        const randomIterations = 2 + Math.floor(Math.random() * 6);
        
        // Random weight
        const weights = [300, 400, 500, 600, 700, 800, 900];
        const randomWeight = weights[Math.floor(Math.random() * weights.length)];
        
        // Random palette
        const palettes = ['mono', 'warm', 'cool', 'neon', 'earth', 'ocean', 'sunset', 'forest'];
        const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
        
        // Random seed
        const randomSeed = this.fractalGenerator.generateSeed();
        
        // Update settings
        this.currentSettings = {
            text: randomText,
            font: randomFont,
            weight: randomWeight,
            algorithm: randomAlgorithm,
            iterations: randomIterations,
            palette: randomPalette,
            seed: randomSeed
        };
        
        // Update UI
        this.updateUI();
        
        // Generate
        this.generateFractal();
    }

    updateUI() {
        document.getElementById('text-input').value = this.currentSettings.text;
        document.getElementById('font-select').value = this.currentSettings.font;
        document.getElementById('weight-select').value = this.currentSettings.weight;
        document.getElementById('algorithm-select').value = this.currentSettings.algorithm;
        document.getElementById('iterations-slider').value = this.currentSettings.iterations;
        document.getElementById('iterations-value').textContent = this.currentSettings.iterations;
        
        // Update palette selection
        document.querySelectorAll('.palette-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.palette === this.currentSettings.palette) {
                option.classList.add('active');
            }
        });
    }

    exportFractal() {
        if (this.isGenerating) return;
        
        this.exportManager.exportWithMetadata(this.currentSettings);
    }

    stopGeneration() {
        if (!this.isGenerating) return;
        
        this.fractalGenerator.stopGeneration();
        this.isGenerating = false;
        this.hideLoading();
        this.updateButtonStates();
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    updateButtonStates() {
        const generateBtn = document.getElementById('generate-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (this.isGenerating) {
            generateBtn.style.display = 'none';
            stopBtn.style.display = 'block';
        } else {
            generateBtn.style.display = 'block';
            stopBtn.style.display = 'none';
        }
    }

    // Debounced generate for text input
    debounceGenerate() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            if (!this.isGenerating) {
                this.generateFractal();
            }
        }, 500);
    }

    // URL management for permalinks
    updateURL() {
        const params = new URLSearchParams();
        params.set('text', this.currentSettings.text);
        params.set('font', this.currentSettings.font);
        params.set('weight', this.currentSettings.weight);
        params.set('algorithm', this.currentSettings.algorithm);
        params.set('iterations', this.currentSettings.iterations);
        params.set('palette', this.currentSettings.palette);
        params.set('seed', this.currentSettings.seed);
        
        const newURL = `${window.location.pathname}?${params.toString()}`;
        history.replaceState(null, '', newURL);
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('text')) {
            this.currentSettings.text = params.get('text');
        }
        if (params.has('font')) {
            this.currentSettings.font = params.get('font');
        }
        if (params.has('weight')) {
            this.currentSettings.weight = parseInt(params.get('weight'));
        }
        if (params.has('algorithm')) {
            this.currentSettings.algorithm = params.get('algorithm');
        }
        if (params.has('iterations')) {
            this.currentSettings.iterations = parseInt(params.get('iterations'));
        }
        if (params.has('palette')) {
            this.currentSettings.palette = params.get('palette');
        }
        if (params.has('seed')) {
            this.currentSettings.seed = parseInt(params.get('seed'));
        } else {
            this.currentSettings.seed = this.fractalGenerator.generateSeed();
        }
        
        this.updateUI();
    }

    generateInitialFractal() {
        // Generate initial fractal after fonts have loaded
        document.fonts.ready.then(() => {
            setTimeout(() => {
                this.generateFractal();
            }, 100);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypeFractalApp();
});

// Add some visual feedback for performance
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
            console.log(`${entry.name}: ${entry.duration}ms`);
        }
    }
});

observer.observe({ entryTypes: ['measure'] });

// Service worker registration for PWA functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 