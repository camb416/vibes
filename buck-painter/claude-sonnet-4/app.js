class BuckPainter {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isMouseDown = false;
        this.currentMaterial = 0;
        this.brushSettings = {
            size: 10,
            strength: 0.5,
            falloff: 0.5
        };
        this.displayMode = 'all';
        this.materials = [];
        this.materialTextures = new Map();
        this.vertexColors = [];
        this.originalGeometry = null;
        
        this.init();
    }

    async init() {
        console.log('BUCK Painter: Starting initialization...');
        
        // Show splash screen
        this.showSplashScreen();
        
        // Wait for assets to load
        await this.loadAssets();
        
        // Initialize THREE.js
        console.log('BUCK Painter: Initializing THREE.js...');
        this.initThree();
        
        // Create default materials
        console.log('BUCK Painter: Creating materials...');
        this.createMaterials();
        
        // Create default model
        console.log('BUCK Painter: Creating default model...');
        this.createDefaultModel();
        
        // Setup UI event handlers
        console.log('BUCK Painter: Setting up event handlers...');
        this.setupEventHandlers();
        
        // Hide splash screen and show app
        console.log('BUCK Painter: Initialization complete!');
        this.hideSplashScreen();
    }

    showSplashScreen() {
        const splashScreen = document.getElementById('splash-screen');
        splashScreen.style.display = 'flex';
        
        // Animate loading bar
        const loadingProgress = document.querySelector('.loading-progress');
        loadingProgress.style.animation = 'loading 2s ease-in-out infinite';
    }

    async loadAssets() {
        // Simulate loading time and wait for DOM to be fully rendered
        return new Promise(resolve => {
            setTimeout(() => {
                // Ensure all resources are loaded
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            }, 1000);
        });
    }

    initThree() {
        // Get canvas element
        const canvas = document.getElementById('viewport');
        const container = document.querySelector('.viewport-container');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);
        
        // Wait for container to be properly sized
        const containerRect = container.getBoundingClientRect();
        const width = containerRect.width || window.innerWidth - 280;
        const height = containerRect.height || window.innerHeight - 60;
        
        console.log('Container dimensions:', width, 'x', height);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        this.camera.position.set(0, 1, 3);
        console.log('Camera created at position:', this.camera.position);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        console.log('Renderer created with size:', width, 'x', height);
        console.log('WebGL context:', this.renderer.getContext());
        
        // Create controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.maxDistance = 10;
        this.controls.minDistance = 0.5;
        
        // Configure mouse buttons - disable left mouse for orbit, use right mouse instead
        this.controls.mouseButtons = {
            LEFT: null,  // Disable left mouse for orbit
            MIDDLE: THREE.MOUSE.DOLLY,  // Middle mouse for zoom
            RIGHT: THREE.MOUSE.ROTATE   // Right mouse for rotate
        };
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3);
        fillLight.position.set(-5, 2, -5);
        this.scene.add(fillLight);
        
        // Add a simple test cube to verify rendering
        const testGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const testCube = new THREE.Mesh(testGeometry, testMaterial);
        testCube.position.set(2, 1, 0);
        this.scene.add(testCube);
        console.log('Test cube added to scene');
        
        // Start render loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Force an immediate resize to ensure proper sizing
        setTimeout(() => this.onWindowResize(), 100);
    }

    createMaterials() {
        this.materials = [
            { name: 'Metal', color: 0x888888, metalness: 0.8, roughness: 0.2 },
            { name: 'Wood', color: 0x8B4513, metalness: 0.0, roughness: 0.8 },
            { name: 'Plastic', color: 0xff4444, metalness: 0.0, roughness: 0.5 },
            { name: 'Glass', color: 0x88ccff, metalness: 0.0, roughness: 0.1 },
            { name: 'Fabric', color: 0x444488, metalness: 0.0, roughness: 0.9 },
            { name: 'Rubber', color: 0x222222, metalness: 0.0, roughness: 0.7 },
            { name: 'Stone', color: 0x666666, metalness: 0.0, roughness: 0.8 },
            { name: 'Leather', color: 0x8B4513, metalness: 0.0, roughness: 0.6 },
            { name: 'Ceramic', color: 0xffffff, metalness: 0.0, roughness: 0.3 }
        ];
        
        this.updateMaterialPalette();
    }

    updateMaterialPalette() {
        const palette = document.getElementById('material-palette');
        palette.innerHTML = '';
        
        this.materials.forEach((material, index) => {
            const btn = document.createElement('div');
            btn.className = 'material-btn';
            btn.style.backgroundColor = `#${material.color.toString(16).padStart(6, '0')}`;
            btn.onclick = () => this.selectMaterial(index);
            
            const name = document.createElement('div');
            name.className = 'material-name';
            name.textContent = material.name;
            btn.appendChild(name);
            
            if (index === this.currentMaterial) {
                btn.classList.add('active');
            }
            
            palette.appendChild(btn);
        });
    }

    selectMaterial(index) {
        this.currentMaterial = index;
        this.updateMaterialPalette();
    }

    createDefaultModel() {
        console.log('Creating default humanoid model...');
        
        // Create a simple humanoid character
        const group = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc,
            vertexColors: true
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        group.add(body);
        console.log('Body created, vertices:', bodyGeometry.attributes.position.count);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc,
            vertexColors: true
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        group.add(head);
        console.log('Head created, vertices:', headGeometry.attributes.position.count);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.8, 6);
        const armMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc,
            vertexColors: true
        });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 0.8, 0);
        leftArm.castShadow = true;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry.clone(), armMaterial.clone());
        rightArm.position.set(0.5, 0.8, 0);
        rightArm.castShadow = true;
        group.add(rightArm);
        console.log('Arms created');
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.12, 1.0, 6);
        const legMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc,
            vertexColors: true
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, -0.5, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry.clone(), legMaterial.clone());
        rightLeg.position.set(0.2, -0.5, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
        console.log('Legs created');
        
        // Store references and initialize vertex colors
        this.currentModel = group;
        console.log('Model group created with', group.children.length, 'parts');
        
        this.initializeVertexColors();
        
        // Add to scene
        this.scene.add(group);
        console.log('Model added to scene');
        
        // Update vertex count
        this.updateVertexCount();
    }

    initializeVertexColors() {
        if (!this.currentModel) return;
        
        this.vertexColors = [];
        this.currentModel.traverse((child) => {
            if (child.isMesh) {
                const geometry = child.geometry;
                const colors = new Float32Array(geometry.attributes.position.count * 3);
                
                // Initialize all vertices to white (no material)
                for (let i = 0; i < colors.length; i += 3) {
                    colors[i] = 1.0;     // R
                    colors[i + 1] = 1.0; // G
                    colors[i + 2] = 1.0; // B
                }
                
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                this.vertexColors.push({
                    mesh: child,
                    colors: colors,
                    materialIndices: new Array(geometry.attributes.position.count).fill(0)
                });
            }
        });
    }

    setupEventHandlers() {
        const canvas = document.getElementById('viewport');
        
        // Mouse events for painting - use higher priority event capturing
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e), true);
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e), true);
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e), true);
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Disable text selection on canvas
        canvas.addEventListener('selectstart', (e) => e.preventDefault());
        
        // UI controls
        document.getElementById('help-btn').addEventListener('click', () => this.showHelp());
        document.getElementById('export-btn').addEventListener('click', () => this.exportModel());
        document.getElementById('import-btn').addEventListener('click', () => this.importModel());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetModel());
        
        // Brush controls
        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSettings.size = parseFloat(e.target.value);
        });
        document.getElementById('brush-strength').addEventListener('input', (e) => {
            this.brushSettings.strength = parseFloat(e.target.value);
        });
        document.getElementById('brush-falloff').addEventListener('input', (e) => {
            this.brushSettings.falloff = parseFloat(e.target.value);
        });
        
        // Display mode controls
        document.querySelectorAll('input[name="display-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.displayMode = e.target.value;
                this.updateDisplayMode();
            });
        });
        
        // Modal controls
        document.querySelector('.modal-close').addEventListener('click', () => this.hideHelp());
        document.getElementById('help-modal').addEventListener('click', (e) => {
            if (e.target.id === 'help-modal') this.hideHelp();
        });
    }

    onMouseDown(event) {
        if (event.button === 0) { // Left mouse button - for painting
            event.preventDefault();
            event.stopPropagation();
            
            this.isMouseDown = true;
            this.updateMousePosition(event);
            this.paint();
            
            // Disable OrbitControls while painting
            this.controls.enabled = false;
            
            // Change cursor to indicate painting mode
            document.getElementById('viewport').style.cursor = 'none';
            
            console.log('Started painting at:', this.mouse.x, this.mouse.y);
        }
    }

    onMouseMove(event) {
        this.updateMousePosition(event);
        
        if (this.isMouseDown) {
            event.preventDefault();
            event.stopPropagation();
            this.paint();
        }
        
        // Update mouse position display
        const mousePos = document.getElementById('mouse-pos');
        const paintingStatus = this.isMouseDown ? ' [PAINTING]' : '';
        mousePos.textContent = `Mouse: (${this.mouse.x.toFixed(2)}, ${this.mouse.y.toFixed(2)})${paintingStatus}`;
    }

    onMouseUp(event) {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            
            // Re-enable OrbitControls after painting
            this.controls.enabled = true;
            
            // Restore cursor
            document.getElementById('viewport').style.cursor = 'crosshair';
            
            console.log('Stopped painting');
        }
    }

    updateMousePosition(event) {
        const canvas = document.getElementById('viewport');
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    paint() {
        if (!this.currentModel) {
            console.log('No model to paint on');
            return;
        }
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.currentModel, true);
        
        if (intersects.length > 0) {
            console.log('Painting on model...');
            const intersection = intersects[0];
            const mesh = intersection.object;
            const point = intersection.point;
            
            // Find the mesh in our vertex colors array
            const vertexColorData = this.vertexColors.find(vc => vc.mesh === mesh);
            if (!vertexColorData) return;
            
            const geometry = mesh.geometry;
            const positions = geometry.attributes.position.array;
            const colors = vertexColorData.colors;
            const materialIndices = vertexColorData.materialIndices;
            const currentMaterial = this.materials[this.currentMaterial];
            
            // Paint vertices within brush range
            for (let i = 0; i < positions.length; i += 3) {
                const vertex = new THREE.Vector3(
                    positions[i],
                    positions[i + 1],
                    positions[i + 2]
                );
                
                // Transform vertex to world space
                vertex.applyMatrix4(mesh.matrixWorld);
                
                const distance = vertex.distanceTo(point);
                const brushRadius = this.brushSettings.size * 0.05; // Scale brush size
                
                if (distance <= brushRadius) {
                    // Calculate falloff
                    const falloff = this.brushSettings.falloff;
                    const strength = this.brushSettings.strength;
                    const influence = Math.max(0, 1 - (distance / brushRadius)) * strength;
                    
                    // Apply falloff curve
                    const finalInfluence = Math.pow(influence, 2 - falloff);
                    
                    // Blend colors
                    const vertexIndex = i / 3;
                    const colorIndex = i;
                    
                    const targetColor = new THREE.Color(currentMaterial.color);
                    const currentColor = new THREE.Color(
                        colors[colorIndex],
                        colors[colorIndex + 1],
                        colors[colorIndex + 2]
                    );
                    
                    currentColor.lerp(targetColor, finalInfluence);
                    
                    colors[colorIndex] = currentColor.r;
                    colors[colorIndex + 1] = currentColor.g;
                    colors[colorIndex + 2] = currentColor.b;
                    
                    // Update material index
                    materialIndices[vertexIndex] = this.currentMaterial;
                }
            }
            
            // Update the geometry
            geometry.attributes.color.needsUpdate = true;
        }
    }

    updateDisplayMode() {
        if (!this.currentModel) return;
        
        this.currentModel.traverse((child) => {
            if (child.isMesh) {
                const material = child.material;
                
                switch (this.displayMode) {
                    case 'all':
                        material.vertexColors = true;
                        break;
                    case 'individual':
                        // Show only selected material
                        this.showIndividualMaterial(child);
                        break;
                    case 'testing':
                        // Show high-visibility testing colors
                        this.showTestingColors(child);
                        break;
                }
            }
        });
    }

    showIndividualMaterial(mesh) {
        const vertexColorData = this.vertexColors.find(vc => vc.mesh === mesh);
        if (!vertexColorData) return;
        
        const colors = vertexColorData.colors;
        const materialIndices = vertexColorData.materialIndices;
        
        for (let i = 0; i < colors.length; i += 3) {
            const vertexIndex = i / 3;
            const materialIndex = materialIndices[vertexIndex];
            
            if (materialIndex === this.currentMaterial) {
                // Show original color
                const material = this.materials[materialIndex];
                const color = new THREE.Color(material.color);
                colors[i] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;
            } else {
                // Show gray
                colors[i] = 0.3;
                colors[i + 1] = 0.3;
                colors[i + 2] = 0.3;
            }
        }
        
        mesh.geometry.attributes.color.needsUpdate = true;
    }

    showTestingColors(mesh) {
        const vertexColorData = this.vertexColors.find(vc => vc.mesh === mesh);
        if (!vertexColorData) return;
        
        const colors = vertexColorData.colors;
        const materialIndices = vertexColorData.materialIndices;
        
        // High-visibility testing colors
        const testingColors = [
            new THREE.Color(0xff0000), // Red
            new THREE.Color(0x00ff00), // Green
            new THREE.Color(0x0000ff), // Blue
            new THREE.Color(0xffff00), // Yellow
            new THREE.Color(0xff00ff), // Magenta
            new THREE.Color(0x00ffff), // Cyan
            new THREE.Color(0xffa500), // Orange
            new THREE.Color(0x800080), // Purple
            new THREE.Color(0xffc0cb)  // Pink
        ];
        
        for (let i = 0; i < colors.length; i += 3) {
            const vertexIndex = i / 3;
            const materialIndex = materialIndices[vertexIndex];
            const testColor = testingColors[materialIndex % testingColors.length];
            
            colors[i] = testColor.r;
            colors[i + 1] = testColor.g;
            colors[i + 2] = testColor.b;
        }
        
        mesh.geometry.attributes.color.needsUpdate = true;
    }

    updateVertexCount() {
        if (!this.currentModel) return;
        
        let totalVertices = 0;
        this.currentModel.traverse((child) => {
            if (child.isMesh) {
                totalVertices += child.geometry.attributes.position.count;
            }
        });
        
        document.getElementById('vertex-count').textContent = `Vertices: ${totalVertices}`;
    }

    showHelp() {
        document.getElementById('help-modal').classList.remove('hidden');
    }

    hideHelp() {
        document.getElementById('help-modal').classList.add('hidden');
    }

    exportModel() {
        if (!this.currentModel) {
            alert('No model to export');
            return;
        }
        
        const exporter = new THREE.GLTFExporter();
        exporter.parse(this.currentModel, (gltf) => {
            const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'buck-painter-model.gltf';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    importModel() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.gltf,.glb';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const loader = new THREE.GLTFLoader();
                    loader.parse(event.target.result, '', (gltf) => {
                        this.loadModel(gltf.scene);
                    });
                };
                reader.readAsArrayBuffer(file);
            }
        };
        input.click();
    }

    loadModel(model) {
        // Remove current model
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }
        
        // Add new model
        this.currentModel = model;
        this.scene.add(model);
        
        // Initialize vertex colors for new model
        this.initializeVertexColors();
        this.updateVertexCount();
    }

    resetModel() {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }
        this.createDefaultModel();
    }

    hideSplashScreen() {
        const splashScreen = document.getElementById('splash-screen');
        const appContainer = document.getElementById('app-container');
        
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
        }, 300);
    }

    onWindowResize() {
        const container = document.querySelector('.viewport-container');
        const containerRect = container.getBoundingClientRect();
        const width = containerRect.width || window.innerWidth - 280;
        const height = containerRect.height || window.innerHeight - 60;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        console.log('Window resized, new dimensions:', width, 'x', height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        try {
            this.controls.update();
            
            // Check if renderer has proper size
            const size = this.renderer.getSize(new THREE.Vector2());
            if (size.width === 0 || size.height === 0) {
                console.warn('Renderer has zero size, forcing resize...');
                this.onWindowResize();
            }
            
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BuckPainter();
}); 