import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

// Splash screen HTML
const splash = document.createElement('div');
splash.id = 'splash-screen';
splash.innerHTML = `
  <div class="splash-container">
    <img src="/buck-logo-black-tight.png" alt="BUCK Logo" class="splash-logo" />
    <h1>BUCK Painter</h1>
  </div>
`;
document.body.appendChild(splash);

// Hide splash and show app after 2 seconds
setTimeout(() => {
  splash.style.display = 'none';
  document.querySelector('#app').style.display = 'block';
  // Placeholder for main app
  document.querySelector('#app').innerHTML = `
    <h2>Welcome to BUCK Painter</h2>
    <input type="file" id="gltf-input" accept=".gltf,.glb" style="margin-bottom:1em" />
    <div id="three-canvas-container" style="width: 100vw; height: 80vh;"></div>
    <p id="loading-text">Loading 3D viewport...</p>
  `;

  // --- THREE.js basic scene setup ---
  import('three').then(async THREE => {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const container = document.getElementById('three-canvas-container');
    container.innerHTML = '';
    // Hide loading text
    const loadingText = document.getElementById('loading-text');
    if (loadingText) loadingText.style.display = 'none';
    // --- Setup scene, camera, renderer first ---
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight * 0.8;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 1, 3);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 4, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    // --- Now declare mesh, geometry, material ---
    let mesh;
    let geometry;
    let material;
    // Default: high-res sphere
    geometry = new THREE.SphereGeometry(1, 64, 64);
    let colors = [];
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      colors.push(0.8, 0.8, 0.8); // initial gray
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    material = new THREE.MeshStandardMaterial({ vertexColors: true });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    // GLTF Loader
    const gltfInput = document.getElementById('gltf-input');
    gltfInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        const arrayBuffer = ev.target.result;
        const loader = new GLTFLoader();
        loader.parse(arrayBuffer, '', gltf => {
          // Remove old mesh
          scene.remove(mesh);
          // Find first mesh in gltf.scene
          let loadedMesh;
          gltf.scene.traverse(obj => {
            if (obj.isMesh && !loadedMesh) loadedMesh = obj;
          });
          if (!loadedMesh) return alert('No mesh found in GLTF');
          // Ensure geometry has color attribute
          geometry = loadedMesh.geometry;
          if (!geometry.attributes.color) {
            let gltfColors = [];
            for (let i = 0; i < geometry.attributes.position.count; i++) {
              gltfColors.push(0.8, 0.8, 0.8);
            }
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(gltfColors, 3));
          }
          material = new THREE.MeshStandardMaterial({ vertexColors: true });
          loadedMesh.material = material;
          mesh = loadedMesh;
          scene.add(mesh);
        }, err => alert('Failed to load GLTF: ' + err));
      };
      reader.readAsArrayBuffer(file);
    });
    // Raycaster for painting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let painting = false;

    // --- Brush config with lil-gui ---
    const { GUI } = await import('lil-gui');
    const brush = {
      size: 0.15,
      color: '#ff0000',
      strength: 1.0
    };
    const gui = new GUI();
    gui.title('Brush Settings');
    gui.add(brush, 'size', 0.01, 0.5, 0.01).name('Size');
    gui.addColor(brush, 'color').name('Color');
    gui.add(brush, 'strength', 0.1, 1.0, 0.01).name('Strength');

    // --- Material palette ---
    const materials = [
      { name: 'Red', color: '#ff0000', roughness: 0.5, metalness: 0.1 },
      { name: 'Green', color: '#00ff00', roughness: 0.3, metalness: 0.2 },
      { name: 'Blue', color: '#0000ff', roughness: 0.7, metalness: 0.5 },
      { name: 'Yellow', color: '#ffff00', roughness: 0.2, metalness: 0.8 },
      { name: 'White', color: '#ffffff', roughness: 0.9, metalness: 0.0 },
      { name: 'Black', color: '#222222', roughness: 0.4, metalness: 0.9 }
    ];
    const palette = {
      material: materials[0].name,
      roughness: materials[0].roughness,
      metalness: materials[0].metalness
    };
    const paletteFolder = gui.addFolder('Material Palette');
    paletteFolder.add(palette, 'material', materials.map(m => m.name)).name('Select').onChange(name => {
      const mat = materials.find(m => m.name === name);
      if (mat) {
        brush.color = mat.color;
        palette.roughness = mat.roughness;
        palette.metalness = mat.metalness;
        paletteFolder.controllers.forEach(ctrl => ctrl.updateDisplay());
      }
    });
    paletteFolder.add(palette, 'roughness', 0, 1, 0.01).onChange(val => {
      material.roughness = val;
    });
    paletteFolder.add(palette, 'metalness', 0, 1, 0.01).onChange(val => {
      material.metalness = val;
    });
    paletteFolder.open();
    // Sync initial material
    material.roughness = palette.roughness;
    material.metalness = palette.metalness;

    // --- Display options ---
    const display = {
      mode: 'Normal',
    };
    const displayModes = ['Normal', 'High-Visibility', 'Wireframe', 'Shaded', 'Normals', 'UV Checker'];
    gui.add(display, 'mode', displayModes).name('Display Mode').onChange(mode => {
      if (mode === 'Normal') {
        // Restore vertex colors from geometry attribute
        geometry.setAttribute('color', geometry.attributes._originalColor.clone());
        material.vertexColors = true;
        material.wireframe = false;
        material.needsUpdate = true;
      } else if (mode === 'High-Visibility') {
        // Assign a unique color to each face
        const faceColors = [];
        for (let i = 0; i < geometry.attributes.position.count; i++) {
          faceColors.push(0, 0, 0);
        }
        // Use a set of high-visibility colors
        const visColors = [
          [1,0,0],[0,1,0],[0,0,1],[1,1,0],[1,0,1],[0,1,1],
          [1,0.5,0],[0.5,0,1],[0,1,0.5],[0.5,1,0],[1,0,0.5],[0,0.5,1]
        ];
        for (let i = 0; i < geometry.index.count; i += 3) {
          const color = visColors[(i/3)%visColors.length];
          const a = geometry.index.getX(i);
          const b = geometry.index.getX(i+1);
          const c = geometry.index.getX(i+2);
          [a,b,c].forEach(idx => {
            faceColors[idx*3] = color[0];
            faceColors[idx*3+1] = color[1];
            faceColors[idx*3+2] = color[2];
          });
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(faceColors, 3));
        material.vertexColors = true;
        material.wireframe = false;
        material.needsUpdate = true;
      } else if (mode === 'Wireframe') {
        material.wireframe = true;
        material.vertexColors = true;
        material.needsUpdate = true;
      } else if (mode === 'Shaded') {
        material.vertexColors = false;
        material.wireframe = false;
        material.needsUpdate = true;
      } else if (mode === 'Normals') {
        // Color by vertex normal
        const normalColors = [];
        for (let i = 0; i < geometry.attributes.normal.count; i++) {
          const nx = geometry.attributes.normal.getX(i);
          const ny = geometry.attributes.normal.getY(i);
          const nz = geometry.attributes.normal.getZ(i);
          normalColors.push((nx+1)/2, (ny+1)/2, (nz+1)/2);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(normalColors, 3));
        material.vertexColors = true;
        material.wireframe = false;
        material.needsUpdate = true;
      } else if (mode === 'UV Checker') {
        // Checkerboard pattern based on UVs
        const checkerColors = [];
        for (let i = 0; i < geometry.attributes.uv.count; i++) {
          const u = geometry.attributes.uv.getX(i);
          const v = geometry.attributes.uv.getY(i);
          const check = ((Math.floor(u * 10) + Math.floor(v * 10)) % 2) === 0;
          checkerColors.push(check ? 1 : 0, check ? 1 : 0, check ? 1 : 0);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(checkerColors, 3));
        material.vertexColors = true;
        material.wireframe = false;
        material.needsUpdate = true;
      }
    });
    // Store original colors for restoration
    geometry.attributes._originalColor = geometry.attributes.color.clone();

    // --- Add OrbitControls ---
    const { OrbitControls } = await import('three-stdlib');
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 10;
    controls.enablePan = false;
    let isOrbiting = false;
    controls.addEventListener('start', () => { isOrbiting = true; });
    controls.addEventListener('end', () => { isOrbiting = false; });

    // --- Model Spin Toggle ---
    const spin = { enabled: false };
    gui.add(spin, 'enabled').name('Spin Model');
    let spinning = true;
    function updateSpinning() {
      spinning = spin.enabled && !painting && !isOrbiting;
    }
    // Update spinning state on relevant events
    controls.addEventListener('start', updateSpinning);
    controls.addEventListener('end', updateSpinning);
    renderer.domElement.addEventListener('pointerdown', () => { painting = true; updateSpinning(); });
    renderer.domElement.addEventListener('pointerup', () => { painting = false; updateSpinning(); });
    renderer.domElement.addEventListener('pointerleave', () => { painting = false; updateSpinning(); });
    // Also update when toggling spin
    gui.controllers.forEach(ctrl => {
      if (ctrl._name === 'Spin Model') {
        ctrl.onChange(updateSpinning);
      }
    });

    function paintVertex(event) {
      if (isOrbiting) return;
      // Get mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(mesh);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const point = intersect.point;
        const normal = intersect.face.normal.clone().transformDirection(mesh.matrixWorld);
        // Only paint vertices that are on the front side (facing the camera)
        let minDist = Infinity;
        let closestIdx = -1;
        for (let i = 0; i < geometry.attributes.position.count; i++) {
          const vx = geometry.attributes.position.getX(i);
          const vy = geometry.attributes.position.getY(i);
          const vz = geometry.attributes.position.getZ(i);
          const v = new THREE.Vector3(vx, vy, vz).applyMatrix4(mesh.matrixWorld);
          // Check if vertex is on the front side
          const toCamera = camera.position.clone().sub(v).normalize();
          if (normal.dot(toCamera) < 0.5) continue; // Tighter threshold for front-facing
          const dist = v.distanceTo(point);
          if (dist < minDist) {
            minDist = dist;
            closestIdx = i;
          }
        }
        if (closestIdx !== -1) {
          const color = new THREE.Color(brush.color);
          for (let i = 0; i < geometry.attributes.position.count; i++) {
            const vx = geometry.attributes.position.getX(i);
            const vy = geometry.attributes.position.getY(i);
            const vz = geometry.attributes.position.getZ(i);
            const v = new THREE.Vector3(vx, vy, vz).applyMatrix4(mesh.matrixWorld);
            const dist = v.distanceTo(new THREE.Vector3(
              geometry.attributes.position.getX(closestIdx),
              geometry.attributes.position.getY(closestIdx),
              geometry.attributes.position.getZ(closestIdx)
            ).applyMatrix4(mesh.matrixWorld));
            if (dist < brush.size) {
              geometry.attributes.color.setXYZ(i, color.r, color.g, color.b);
            }
          }
          geometry.attributes.color.needsUpdate = true;
        }
      }
    }
    renderer.domElement.addEventListener('pointerdown', e => { if (!isOrbiting) { painting = true; paintVertex(e); } });
    renderer.domElement.addEventListener('pointermove', e => { if (painting && !isOrbiting) paintVertex(e); });
    renderer.domElement.addEventListener('pointerup', () => { painting = false; });
    renderer.domElement.addEventListener('pointerleave', () => { painting = false; });
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      if (spinning) {
        mesh.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    }
    animate();
  });
}, 2000);

document.querySelector('#app').style.display = 'none';
