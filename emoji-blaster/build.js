const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Files to copy to dist
const filesToCopy = [
    'index.html',
    'style.css',
    'script.js'
];

// Copy files to dist
filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(distDir, file);
    
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${file} to dist/`);
    } else {
        console.log(`❌ File ${file} not found`);
    }
});

// Minify CSS for production (basic minification)
const cssPath = path.join(distDir, 'style.css');
if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    // Basic minification: remove comments and extra whitespace
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    css = css.replace(/\s+/g, ' ');
    css = css.replace(/;\s*}/g, '}');
    css = css.replace(/{\s*/g, '{');
    css = css.replace(/;\s*/g, ';');
    fs.writeFileSync(cssPath, css);
    console.log('✅ Minified CSS');
}

// Add cache busting timestamp to HTML
const htmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    const timestamp = Date.now();
    html = html.replace('style.css', `style.css?v=${timestamp}`);
    html = html.replace('script.js', `script.js?v=${timestamp}`);
    fs.writeFileSync(htmlPath, html);
    console.log('✅ Added cache busting to HTML');
}

console.log('\n🎉 Production build complete! Files are in the dist/ directory.');
console.log('📁 You can deploy the dist/ folder to any static web server.'); 