const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
} else {
  // Clean dist directory
  console.log('Cleaning dist directory...');
  fs.rmSync('dist', { recursive: true, force: true });
  fs.mkdirSync('dist');
}

console.log('Building project...');

// Copy index.html to dist
console.log('Copying index.html...');
fs.copyFileSync('index.html', 'dist/index.html');

// Create src directory in dist
if (!fs.existsSync('dist/src')) {
  fs.mkdirSync('dist/src', { recursive: true });
}

// Copy all files from src to dist/src
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy src directory
console.log('Copying src directory...');
copyDir('src', 'dist/src');

// Copy assets directory
console.log('Copying assets directory...');
if (fs.existsSync('assets')) {
  if (!fs.existsSync('dist/assets')) {
    fs.mkdirSync('dist/assets', { recursive: true });
  }
  copyDir('assets', 'dist/assets');
} else {
  console.warn('Warning: assets directory not found!');
}

// Copy any other necessary files (like Phaser library)
if (fs.existsSync('lib')) {
  console.log('Copying lib directory...');
  if (!fs.existsSync('dist/lib')) {
    fs.mkdirSync('dist/lib', { recursive: true });
  }
  copyDir('lib', 'dist/lib');
}

console.log('Build completed! Files are in the dist directory.');
console.log('Run "npm run serve" to test the build locally.'); 