// Main application controller
class App {
    constructor() {
        this.isGridVisible = false;
        this.currentPosterIndex = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.generateInitialPosters();
    }

    bindEvents() {
        // Reload button
        const reloadBtn = document.getElementById('reload-btn');
        reloadBtn.addEventListener('click', () => {
            this.reload();
        });

        // Grid toggle checkbox
        const gridToggle = document.getElementById('grid-toggle');
        gridToggle.addEventListener('change', (e) => {
            this.toggleGrid(e.target.checked);
        });

        // Export button
        const exportBtn = document.getElementById('export-btn');
        exportBtn.addEventListener('click', () => {
            this.handleExport();
        });

        // Content dropdown toggle
        const contentToggle = document.getElementById('content-toggle');
        const contentPanel = document.getElementById('content-panel');
        // Content panel toggle
        contentToggle.addEventListener('click', () => {
            contentPanel.classList.toggle('active');
        });

        // Click outside to close content panel
        document.addEventListener('click', (e) => {
            if (!contentToggle.contains(e.target) && !contentPanel.contains(e.target)) {
                contentPanel.classList.remove('active');
            }
        });

        // Apply content button
        const applyContent = document.getElementById('apply-content');
        applyContent.addEventListener('click', () => {
            this.applyCustomContent();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.reload();
                }
            }
            if (e.key === 'g' || e.key === 'G') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const gridToggle = document.getElementById('grid-toggle');
                    gridToggle.checked = !gridToggle.checked;
                    this.toggleGrid(gridToggle.checked);
                }
            }

        });
    }

    async generateInitialPosters() {
        try {
            await posterGenerator.generateAllPosters();
            this.showLoadingComplete();
        } catch (error) {
            console.error('Error generating initial posters:', error);
            this.showError('Failed to generate posters. Please try again.');
        }
    }

    async reload() {
        this.showLoading();
        try {
            await posterGenerator.generateAllPosters();
            this.showLoadingComplete();
        } catch (error) {
            console.error('Error reloading posters:', error);
            this.showError('Failed to reload posters. Please try again.');
        }
    }

    toggleGrid(show) {
        this.isGridVisible = show;
        posterGenerator.toggleGrid(show);
    }

    async applyCustomContent() {
        const titleInput = document.getElementById('custom-title');
        const subtitleInput = document.getElementById('custom-subtitle');
        const bodyInput = document.getElementById('custom-body');
        const creditsInput = document.getElementById('custom-credits');
        const dateInput = document.getElementById('custom-date');
        const venueInput = document.getElementById('custom-venue');
        const copyrightInput = document.getElementById('custom-copyright');
        
        // Set custom content in poster generator
        posterGenerator.setCustomContent(
            titleInput.value,
            subtitleInput.value,
            bodyInput.value,
            creditsInput.value,
            dateInput.value,
            venueInput.value,
            copyrightInput.value
        );
        
        // Close the content panel
        const contentPanel = document.getElementById('content-panel');
        contentPanel.classList.remove('active');
        
        // Regenerate all posters with the new content
        await this.reload();
    }

    async handleExport() {
        const exportButton = document.getElementById('export-btn');
        const posterIndex = exportButton.getAttribute('data-poster-index');
        const format = document.getElementById('export-format').value;

        if (!posterIndex) {
            console.error('No poster selected for export');
            return;
        }

        try {
            if (format === 'figma') {
                // For Figma export, handle the async opening
                await exportHandler.exportPoster(parseInt(posterIndex), format);
                // Don't show loading/complete states for Figma since it opens directly
            } else {
                this.showExportLoading();
                await exportHandler.exportPoster(parseInt(posterIndex), format);
                this.showExportComplete();
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('Export failed. Please try again.');
        }
    }

    showLoading() {
        const reloadBtn = document.getElementById('reload-btn');
        const originalText = reloadBtn.textContent;
        reloadBtn.textContent = 'Loading...';
        reloadBtn.disabled = true;
        
        setTimeout(() => {
            reloadBtn.textContent = originalText;
            reloadBtn.disabled = false;
        }, 3000);
    }

    showLoadingComplete() {
        const reloadBtn = document.getElementById('reload-btn');
        reloadBtn.textContent = 'Reload';
        reloadBtn.disabled = false;
    }

    showExportLoading() {
        const exportBtn = document.getElementById('export-btn');
        exportBtn.textContent = 'Exporting...';
        exportBtn.disabled = true;
    }

    showExportComplete() {
        const exportBtn = document.getElementById('export-btn');
        exportBtn.textContent = 'Export';
        exportBtn.disabled = false;
    }

    showError(message) {
        // Simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff0000;
            color: #ffffff;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 9999;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Enhanced poster interaction
class PosterInteraction {
    constructor() {
        this.setupPosterHoverEffects();
    }

    setupPosterHoverEffects() {
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.poster')) {
                const poster = e.target.closest('.poster');
                this.enhancePosterHover(poster);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.poster')) {
                const poster = e.target.closest('.poster');
                this.removePosterHover(poster);
            }
        });
    }

    enhancePosterHover(poster) {
        // Add subtle animation and effects
        poster.style.transform = 'scale(1.02) translateY(-2px)';
        poster.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        poster.style.transition = 'all 0.3s ease';
    }

    removePosterHover(poster) {
        poster.style.transform = 'scale(1) translateY(0)';
        poster.style.boxShadow = 'none';
    }
}

// Performance optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImageLoading();
        this.setupLazyLoading();
    }

    optimizeImageLoading() {
        // Preload critical images
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjFGMUYxIi8+CjxyZWN0IHg9IjE1MCIgeT0iMTI1IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMDAwMDAwIi8+Cjwvc3ZnPgo=';
        document.head.appendChild(link);
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            // Observe all images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    const posterInteraction = new PosterInteraction();
    const performanceOptimizer = new PerformanceOptimizer();
    
    console.log('Swiss Poster Generator initialized');
    console.log('Keyboard shortcuts:');
    console.log('- Ctrl/Cmd + R: Reload posters');
    console.log('- Ctrl/Cmd + G: Toggle grid view');
    console.log('- Escape: Close export menu');
}); 