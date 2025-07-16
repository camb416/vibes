import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';

// Canvas & Renderer
const canvas = document.getElementById('viewport');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Scene & Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.5, 3);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Utilities
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// State
const state = {
  brushSize: 0.1,
  painting: false,
  activeColor: '#ff0000',
  palette: {
    Material1: '#ff0000',
    Material2: '#00ff00',
    Material3: '#0000ff',
    Material4: '#ffff00',
  },
};

let currentMesh;

// Default Model
function createDefaultModel() {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3)
  );
  for (let i = 0; i < geometry.attributes.color.count; i++) {
    geometry.attributes.color.setXYZ(i, 1, 1, 1);
  }

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

currentMesh = createDefaultModel();

// Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Painting Logic
canvas.addEventListener('pointerdown', (e) => {
  state.painting = true;
  paintAt(e);
});

canvas.addEventListener('pointermove', (e) => {
  if (state.painting) {
    paintAt(e);
  }
});

window.addEventListener('pointerup', () => (state.painting = false));

function paintAt(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(currentMesh);
  if (intersects.length) {
    const point = intersects[0].point;
    applyBrush(point);
    currentMesh.geometry.attributes.color.needsUpdate = true;
  }
}

function applyBrush(point) {
  const geo = currentMesh.geometry;
  const pos = geo.attributes.position;
  const colorAttr = geo.attributes.color;
  const brushRadius = state.brushSize;
  const targetColor = new THREE.Color(state.activeColor);

  for (let i = 0; i < pos.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(pos, i);
    currentMesh.localToWorld(vertex);
    const dist = vertex.distanceTo(point);
    if (dist <= brushRadius) {
      const influence = 1 - dist / brushRadius; // linear falloff
      const existingColor = new THREE.Color().fromBufferAttribute(colorAttr, i);
      existingColor.lerp(targetColor, influence);
      colorAttr.setXYZ(i, existingColor.r, existingColor.g, existingColor.b);
    }
  }
}

// GUI
const gui = new GUI();

const brushFolder = gui.addFolder('Brush');
brushFolder.add(state, 'brushSize', 0.01, 0.5, 0.01).name('Size');

const paletteFolder = gui.addFolder('Materials');
Object.keys(state.palette).forEach((key) => {
  paletteFolder.addColor(state.palette, key);
});

// Active material selection dropdown
gui
  .add(state, 'activeColor', state.palette)
  .name('Active Material');

gui
  .add({ 'Load Model': () => document.getElementById('file-input').click() }, 'Load Model')
  .name('Load Model');

gui.add({ 'Export GLTF': exportGLTF }, 'Export GLTF').name('Export GLTF');

gui
  .add({ Instructions: () => document.getElementById('instructions').classList.remove('hidden') }, 'Instructions')
  .name('Instructions');

// Model Loading
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const loader = new GLTFLoader();
  loader.load(
    url,
    (gltf) => {
      // Remove old mesh
      if (currentMesh) scene.remove(currentMesh);

      currentMesh = gltf.scene.children.find((obj) => obj.isMesh);
      if (!currentMesh) {
        alert('No mesh found in the selected model!');
        return;
      }

      // Ensure vertex colors exist
      if (!currentMesh.geometry.attributes.color) {
        currentMesh.geometry.setAttribute(
          'color',
          new THREE.BufferAttribute(
            new Float32Array(currentMesh.geometry.attributes.position.count * 3),
            3
          )
        );
        for (let i = 0; i < currentMesh.geometry.attributes.color.count; i++) {
          currentMesh.geometry.attributes.color.setXYZ(i, 1, 1, 1);
        }
      }

      currentMesh.material.vertexColors = true;
      scene.add(currentMesh);
    },
    undefined,
    (err) => console.error(err)
  );
});

// Export Function
function exportGLTF() {
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result) => {
      const output =
        result instanceof ArrayBuffer ? result : JSON.stringify(result, null, 2);
      saveArrayBuffer(new Blob([output], { type: 'application/octet-stream' }), 'buckPainter.gltf');
    },
    { binary: false }
  );
}

function saveArrayBuffer(blob, filename) {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Splash Screen & Instructions
const splash = document.getElementById('splash-screen');
const startBtn = document.getElementById('start-btn');
const closeInstructionsBtn = document.getElementById('close-instructions');

startBtn.addEventListener('click', () => splash.classList.add('hidden'));
closeInstructionsBtn.addEventListener('click', () =>
  document.getElementById('instructions').classList.add('hidden')
);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate(); 