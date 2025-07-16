class ExportManager {
    constructor(canvas) {
        this.canvas = canvas;
    }

    // Export canvas as PNG
    exportAsPNG(filename = null) {
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `type-fractal-${timestamp}.png`;
        }

        try {
            // Create a high-resolution version for export
            const exportCanvas = document.createElement('canvas');
            const exportCtx = exportCanvas.getContext('2d');
            
            // Set export dimensions (higher resolution for better quality)
            const exportWidth = 2048;
            const exportHeight = 2048;
            exportCanvas.width = exportWidth;
            exportCanvas.height = exportHeight;
            
            // Scale and draw the current canvas content
            exportCtx.imageSmoothingEnabled = false;
            exportCtx.webkitImageSmoothingEnabled = false;
            exportCtx.mozImageSmoothingEnabled = false;
            exportCtx.msImageSmoothingEnabled = false;
            
            // Fill with white background
            exportCtx.fillStyle = '#ffffff';
            exportCtx.fillRect(0, 0, exportWidth, exportHeight);
            
            // Draw the fractal content scaled up
            exportCtx.drawImage(this.canvas, 0, 0, exportWidth, exportHeight);
            
            // Convert to blob and download
            exportCanvas.toBlob((blob) => {
                if (blob) {
                    this.downloadBlob(blob, filename);
                } else {
                    console.error('Failed to create blob for export');
                }
            }, 'image/png', 1.0);
            
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    }

    // Download blob as file
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    }

    // Export with metadata
    exportWithMetadata(settings, filename = null) {
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `type-fractal-${settings.seed}-${timestamp}.png`;
        }

        // Create a canvas with metadata overlay
        const metadataCanvas = document.createElement('canvas');
        const metadataCtx = metadataCanvas.getContext('2d');
        
        const exportWidth = 2048;
        const exportHeight = 2048 + 100; // Extra space for metadata
        metadataCanvas.width = exportWidth;
        metadataCanvas.height = exportHeight;
        
        // Fill with white background
        metadataCtx.fillStyle = '#ffffff';
        metadataCtx.fillRect(0, 0, exportWidth, exportHeight);
        
        // Draw the fractal
        metadataCtx.drawImage(this.canvas, 0, 0, exportWidth, 2048);
        
        // Add metadata text
        metadataCtx.fillStyle = '#000000';
        metadataCtx.font = '24px "Inter", sans-serif';
        metadataCtx.textAlign = 'left';
        
        const metadataY = 2048 + 30;
        const metadataText = `TYPE FRACTALS | Text: "${settings.text}" | Font: ${settings.font} | Algorithm: ${settings.algorithm} | Iterations: ${settings.iterations} | Seed: ${settings.seed} | Palette: ${settings.palette}`;
        
        metadataCtx.fillText(metadataText, 20, metadataY);
        
        // Convert to blob and download
        metadataCanvas.toBlob((blob) => {
            if (blob) {
                this.downloadBlob(blob, filename);
            } else {
                console.error('Failed to create blob for export with metadata');
            }
        }, 'image/png', 1.0);
    }

    // Get image data URL for sharing
    getImageDataURL() {
        try {
            return this.canvas.toDataURL('image/png', 1.0);
        } catch (error) {
            console.error('Failed to get image data URL:', error);
            return null;
        }
    }

    // Copy image to clipboard (if supported)
    async copyToClipboard() {
        try {
            const blob = await this.getImageBlob();
            if (blob && navigator.clipboard && navigator.clipboard.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    // Get image as blob
    getImageBlob() {
        return new Promise((resolve, reject) => {
            this.canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            }, 'image/png', 1.0);
        });
    }

    // Save settings as JSON
    saveSettings(settings, filename = null) {
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `type-fractal-settings-${timestamp}.json`;
        }

        const settingsData = {
            ...settings,
            timestamp: new Date().toISOString(),
            version: '1.0',
            generator: 'Type Fractals'
        };

        const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
            type: 'application/json'
        });

        this.downloadBlob(blob, filename);
    }

    // Load settings from JSON file
    loadSettings(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    resolve(settings);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
} 