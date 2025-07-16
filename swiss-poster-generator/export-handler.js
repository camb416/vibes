class ExportHandler {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.initCanvas();
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        // Default to letter size, will be resized per poster
        this.canvas.width = 850;
        this.canvas.height = 1100;
        this.ctx = this.canvas.getContext('2d');
    }

    getDimensions(posterElement) {
        const isLetter = posterElement.classList.contains('format-letter');
        
        if (isLetter) {
            return {
                width: 850,
                height: 1100,
                format: 'letter'
            };
        } else {
            return {
                width: 1100,
                height: 1700,
                format: 'spread'
            };
        }
    }

    async exportPoster(posterIndex, format) {
        const posterData = posterGenerator.getPosterData(posterIndex);
        if (!posterData) {
            console.error('Poster not found');
            return;
        }

        switch (format) {
            case 'svg':
                return this.exportAsSVG(posterData);
            case 'png':
                return this.exportAsPNG(posterData);
            case 'figma':
                return this.exportAsFigma(posterData);
            default:
                console.error('Unknown export format');
        }
    }

    exportAsSVG(posterData) {
        const svg = this.createSVG(posterData);
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `poster-${posterData.title.toLowerCase().replace(/\s+/g, '-')}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    createSVG(posterData) {
        const dimensions = this.getDimensions(posterData.element);
        const posterElement = posterData.element;
        const posterRect = posterElement.getBoundingClientRect();
        
        return this.captureActualDOMStructure(posterElement, posterRect, dimensions);
    }

    wrapText(text, maxLength) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + word).length <= maxLength) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });

        if (currentLine) lines.push(currentLine);
        return lines.join('<br/>');
    }

    async exportAsPNG(posterData) {
        // Use HTML2Canvas-like approach by converting the SVG to canvas
        const svg = this.createCompleteSVG(posterData);
        
        return new Promise((resolve, reject) => {
            const dimensions = this.getDimensions(posterData.element);
            
            // Create a temporary image from the SVG
            const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = () => {
                // Resize canvas to match poster format
                this.canvas.width = dimensions.width;
                this.canvas.height = dimensions.height;
                
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw the SVG image onto the canvas
                this.ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
                
                // Export as PNG
                this.canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `poster-${posterData.title.toLowerCase().replace(/\s+/g, '-')}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    URL.revokeObjectURL(svgUrl);
                    resolve();
                }, 'image/png');
            };
            
            img.onerror = (error) => {
                URL.revokeObjectURL(svgUrl);
                reject(error);
            };
            
            img.src = svgUrl;
        });
    }



    async exportAsFigma(posterData) {
        try {
            // Create a complete SVG with all the poster's styling
            const completeSVG = this.createCompleteSVG(posterData);
            
            // Download the SVG file
            const blob = new Blob([completeSVG], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `figma-import-${posterData.title.toLowerCase().replace(/\s+/g, '-')}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            // Show import instructions
            this.showFigmaImportInstructions(posterData);
            
        } catch (error) {
            console.error('Figma export failed:', error);
            alert('Figma export failed. Please try again.');
        }
    }

    createCompleteSVG(posterData) {
        const dimensions = this.getDimensions(posterData.element);
        const posterElement = posterData.element;
        const posterRect = posterElement.getBoundingClientRect();
        
        return this.captureActualDOMStructure(posterElement, posterRect, dimensions);
    }

    captureActualDOMStructure(posterElement, posterRect, dimensions) {
        const width = dimensions.width;
        const height = dimensions.height;
        
        // Get actual background from computed style
        const posterStyle = window.getComputedStyle(posterElement);
        const bgColor = posterStyle.backgroundColor || '#ffffff';
        
        let svgContent = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <style>
                        .poster-text { font-family: 'Helvetica Neue', Arial, sans-serif; }
                    </style>
                </defs>
                
                <!-- Background -->
                <rect width="${width}" height="${height}" fill="${bgColor}"/>
        `;
        
        // Process all child elements recursively
        const allElements = posterElement.querySelectorAll('*');
        
        // Sort by z-index to maintain proper layering
        const sortedElements = Array.from(allElements).sort((a, b) => {
            const aZ = parseInt(window.getComputedStyle(a).zIndex) || 0;
            const bZ = parseInt(window.getComputedStyle(b).zIndex) || 0;
            return aZ - bZ;
        });
        
        sortedElements.forEach(element => {
            const elementSVG = this.createElementSVG(element, posterRect, posterElement);
            if (elementSVG) {
                svgContent += elementSVG;
            }
        });
        
        svgContent += `
            </svg>
        `;
        
        return svgContent;
    }



    createElementSVG(element, posterRect, posterElement) {
        const elementRect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        // Skip if element is not visible
        if (elementRect.width === 0 || elementRect.height === 0 || 
            computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            return null;
        }
        
        // Calculate relative position to poster
        const relativeX = elementRect.left - posterRect.left;
        const relativeY = elementRect.top - posterRect.top;
        
        // Handle transform
        const transform = computedStyle.transform;
        let transformAttr = '';
        if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
            const transformOriginX = relativeX + elementRect.width / 2;
            const transformOriginY = relativeY + elementRect.height / 2;
            transformAttr = `transform="${this.escapeAttribute(transform)}" transform-origin="${transformOriginX} ${transformOriginY}"`;
        }
        
        // Handle different element types
        const tagName = element.tagName.toLowerCase();
        
        // Handle images
        if (tagName === 'img') {
            const src = element.src;
            const opacity = computedStyle.opacity;
            
            let imageElement = `<image x="${relativeX}" y="${relativeY}" width="${elementRect.width}" height="${elementRect.height}" href="${this.escapeAttribute(src)}" opacity="${opacity}"`;
            
            if (transformAttr) {
                imageElement += ` ${transformAttr}`;
            }
            
            imageElement += `/>`;
            
            return imageElement;
        }
        
        // Handle text elements
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || 
            tagName === 'p' || tagName === 'div' || tagName === 'span') {
            
            const textContent = element.textContent.trim();
            if (!textContent) return null;
            
            const fontSize = computedStyle.fontSize;
            const fontWeight = computedStyle.fontWeight;
            const fontFamily = this.cleanFontFamily(computedStyle.fontFamily);
            const color = computedStyle.color;
            const textTransform = computedStyle.textTransform;
            const letterSpacing = computedStyle.letterSpacing;
            const lineHeight = computedStyle.lineHeight;
            const textAlign = computedStyle.textAlign;
            const backgroundColor = computedStyle.backgroundColor;
            const padding = computedStyle.padding;
            const borderRadius = computedStyle.borderRadius;
            const writingMode = computedStyle.writingMode;
            
            // Handle vertical text
            if (writingMode === 'vertical-lr' || writingMode === 'vertical-rl') {
                let textElement = `<text x="${relativeX + elementRect.width / 2}" y="${relativeY}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" text-anchor="middle"`;
                
                if (transformAttr) {
                    textElement += ` ${transformAttr}`;
                }
                
                textElement += `>${this.escapeXML(textContent)}</text>`;
                return textElement;
            }
            
            // For complex styling or backgrounds, use foreignObject
            if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent' ||
                padding !== '0px' || borderRadius !== '0px' || transform !== 'none') {
                
                return `<foreignObject x="${relativeX}" y="${relativeY}" width="${elementRect.width}" height="${elementRect.height}">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: ${fontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color}; line-height: ${lineHeight}; text-align: ${textAlign}; background-color: ${backgroundColor}; padding: ${padding}; border-radius: ${borderRadius}; width: 100%; height: 100%; box-sizing: border-box;">
                        ${this.escapeXML(textContent)}
                    </div>
                </foreignObject>`;
            }
            
            // Simple text
            let textElement = `<text x="${relativeX}" y="${relativeY + elementRect.height * 0.8}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}"`;
            
            if (transformAttr) {
                textElement += ` ${transformAttr}`;
            }
            
            textElement += `>${this.escapeXML(textContent)}</text>`;
            return textElement;
        }
        
        // Handle geometric shapes and backgrounds
        if (tagName === 'div' && !element.textContent.trim()) {
            const backgroundColor = computedStyle.backgroundColor;
            const borderRadius = computedStyle.borderRadius;
            
            if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
                // Handle circles
                if (element.classList.contains('circle') || borderRadius.includes('50%')) {
                    let circleElement = `<circle cx="${relativeX + elementRect.width / 2}" cy="${relativeY + elementRect.height / 2}" r="${Math.min(elementRect.width, elementRect.height) / 2}" fill="${backgroundColor}"`;
                    
                    if (transformAttr) {
                        circleElement += ` ${transformAttr}`;
                    }
                    
                    circleElement += `/>`;
                    return circleElement;
                }
                
                // Handle triangles
                if (element.classList.contains('triangle')) {
                    const centerX = relativeX + elementRect.width / 2;
                    const topY = relativeY;
                    const bottomY = relativeY + elementRect.height;
                    const leftX = relativeX;
                    const rightX = relativeX + elementRect.width;
                    
                    let triangleElement = `<polygon points="${centerX},${topY} ${leftX},${bottomY} ${rightX},${bottomY}" fill="${backgroundColor}"`;
                    
                    if (transformAttr) {
                        triangleElement += ` ${transformAttr}`;
                    }
                    
                    triangleElement += `/>`;
                    return triangleElement;
                }
                
                // Regular rectangles
                let rectElement = `<rect x="${relativeX}" y="${relativeY}" width="${elementRect.width}" height="${elementRect.height}" fill="${backgroundColor}"`;
                
                if (borderRadius && borderRadius !== '0px' && borderRadius !== '0') {
                    const radiusValue = parseFloat(borderRadius);
                    if (!isNaN(radiusValue) && radiusValue > 0) {
                        rectElement += ` rx="${radiusValue}"`;
                    }
                }
                
                if (transformAttr) {
                    rectElement += ` ${transformAttr}`;
                }
                
                rectElement += `/>`;
                return rectElement;
            }
        }
        
        return null;
    }
    
    escapeXML(text) {
        return text.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;');
    }
    
    escapeAttribute(value) {
        return value.replace(/"/g, '&quot;')
                   .replace(/'/g, '&#39;')
                   .replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
    }
    
    cleanFontFamily(fontFamily) {
        // Remove quotes and clean up font family string
        return fontFamily.replace(/"/g, '').replace(/'/g, '').split(',')[0].trim();
    }

    getLayoutType(posterElement) {
        const classes = posterElement.className;
        if (classes.includes('layout-type-dominant')) return 'type-dominant';
        if (classes.includes('layout-geometric-dominant')) return 'geometric-dominant';
        if (classes.includes('layout-massive-type-geometric')) return 'massive-type-geometric';
        if (classes.includes('layout-split-screen-bold')) return 'split-screen-bold';
        if (classes.includes('layout-diagonal-chaos')) return 'diagonal-chaos';
        if (classes.includes('layout-asymmetrical')) return 'asymmetrical';
        if (classes.includes('layout-large-type')) return 'large-type';
        if (classes.includes('layout-grid-break')) return 'grid-break';
        return 'standard';
    }

    getBackgroundType(posterElement) {
        const classes = posterElement.className;
        if (classes.includes('bg-black')) return 'black';
        if (classes.includes('bg-red')) return 'red';
        if (classes.includes('bg-dark-gray')) return 'dark-gray';
        if (classes.includes('bg-tinted')) return 'tinted';
        return 'white';
    }



    showFigmaImportInstructions(posterData) {
        const instructionModal = document.createElement('div');
        instructionModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        `;
        
        const instructionContent = document.createElement('div');
        instructionContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;
        
        instructionContent.innerHTML = `
            <h2 style="margin: 0 0 20px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 24px; color: #000;">
                📥 Import to Figma
            </h2>
            
            <p style="margin: 0 0 20px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333;">
                Your poster "<strong>${posterData.title}</strong>" has been downloaded as an SVG file with all styling preserved.
            </p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: left;">
                <p style="margin: 0 0 10px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: bold; color: #000;">
                    To import into Figma:
                </p>
                <ol style="margin: 0; padding-left: 20px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
                    <li>Open Figma in your browser or app</li>
                    <li>Create a new file or open an existing one</li>
                    <li>Drag and drop the SVG file onto the canvas</li>
                    <li>Or use File → Place Image and select your SVG</li>
                </ol>
            </div>
            
            <p style="margin: 0 0 20px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #666;">
                The poster will import with all typography, colors, and layout preserved as vector elements.
            </p>
            
            <button id="open-figma-btn" style="
                background: #cc6660;
                color: white;
                border: none;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 10px;
                transition: all 0.2s ease;
            ">
                Open Figma
            </button>
            
            <button id="close-instruction-btn" style="
                background: #333;
                color: white;
                border: none;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
            ">
                Close
            </button>
        `;
        
        instructionModal.appendChild(instructionContent);
        document.body.appendChild(instructionModal);
        
        // Event listeners
        document.getElementById('open-figma-btn').addEventListener('click', () => {
            window.open('https://www.figma.com/file/new', '_blank');
        });
        
        document.getElementById('close-instruction-btn').addEventListener('click', () => {
            document.body.removeChild(instructionModal);
        });
        
        // Close on backdrop click
        instructionModal.addEventListener('click', (e) => {
            if (e.target === instructionModal) {
                document.body.removeChild(instructionModal);
            }
        });
    }




}

// Initialize the export handler
const exportHandler = new ExportHandler(); 