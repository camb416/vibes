class PosterGenerator {
    constructor() {
        this.unsplashAccessKey = 'demo'; // Using demo mode for now
        this.posterCount = 16;
        this.currentPosters = [];
        this.greedText = this.generateGreedText();
        this.customContent = {
            title: '',
            subtitle: '',
            body: '',
            credits: '',
            date: '',
            venue: '',
            copyright: ''
        };
        this.hideMenuTimeout = null;
        this.posterThemes = [
            { theme: 'jazz', keywords: ['music', 'instrument', 'concert', 'performance'] },
            { theme: 'architecture', keywords: ['building', 'structure', 'modern', 'geometric'] },
            { theme: 'exhibition', keywords: ['art', 'gallery', 'museum', 'display'] },
            { theme: 'festival', keywords: ['celebration', 'event', 'cultural', 'gathering'] }
        ];
    }

    generateGreedText() {
        const greedWords = [
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
            'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
            'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
            'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
            'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'voluptate', 'velit',
            'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
            'cupidatat', 'non', 'proident', 'sunt', 'in', 'culpa', 'qui', 'officia',
            'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
        ];

        const titles = [
            'SYMPOSIUM', 'KONZERT', 'AUSSTELLUNG', 'FESTIVAL', 'ARCHITEKTUR', 'MODERNE',
            'JAZZ', 'ENSEMBLE', 'GALERIE', 'PERFORMANCE', 'DESIGN', 'KULTUR'
        ];

        const subtitles = [
            'ZÜRICH', 'BASEL', 'GENF', 'BERN', 'LAUSANNE', 'LUZERN',
            '1970', '1971', '1972', '1973', '1974', '1975',
            'APRIL', 'MAI', 'JUNI', 'JULI', 'AUGUST', 'SEPTEMBER'
        ];

        const credits = [
            'Design: Studio Basel', 'Photo: Hans Müller', 'Grafik: Peter Steiner', 'Konzept: Maria Weber',
            'Typografie: Klaus Müller', 'Produktion: Atelier Zürich', 'Regie: Anna Schmidt', 'Musik: Jazz Ensemble',
            'Druck: Offsetdruck Basel', 'Papier: Munken Paper', 'Auflage: 1000 Ex.', 'Format: 42 x 59.4 cm'
        ];

        const dates = [
            '1970', '1971', '1972', '1973', '1974', '1975', '1976',
            'April 1972', 'Mai 1973', 'Juni 1974', 'Juli 1975',
            '15. April 1972', '20. Mai 1973', '12. Juni 1974'
        ];

        const venues = [
            'Kunsthalle Basel', 'Théâtre de la Ville', 'Schauspielhaus Zürich', 'Opernhaus Zürich',
            'Kunstmuseum Bern', 'Galerie Tschudi', 'Festival de Montreux', 'Lucerne Festival',
            'Dampfzentrale Bern', 'Rote Fabrik', 'Moods Zürich', 'Kaufleuten'
        ];

        const copyrights = [
            '© 1972 Basel', '© Kunsthalle Zürich', '© Festival Organisation',
            'All rights reserved', 'Alle Rechte vorbehalten', '© Design Studio',
            '© 1973 Switzerland', '© Schweizer Kulturstiftung'
        ];

        return {
            words: greedWords,
            titles: titles,
            subtitles: subtitles,
            credits: credits,
            dates: dates,
            venues: venues,
            copyrights: copyrights
        };
    }

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateRandomText(wordCount) {
        const words = [];
        for (let i = 0; i < wordCount; i++) {
            words.push(this.getRandomElement(this.greedText.words));
        }
        return words.join(' ');
    }

    async getRandomImage() {
        // 1970s-focused image topics
        const imageTopics = [
            'vintage+70s', 'retro+1970s', 'jazz+1970s', 'concert+vintage', 'architecture+70s',
            'swiss+design+70s', 'vintage+poster', 'retro+graphic', 'modernist+70s', 'brutalist',
            'vintage+photography', 'analog+70s', 'grain+texture', 'vintage+art', 'retro+music',
            'experimental+70s', 'avant+garde+70s', 'minimalist+70s', 'geometric+70s', 'vintage+pattern'
        ];
        
        const topic = this.getRandomElement(imageTopics);
        const width = 400;
        const height = 300;
        
        // Using picsum.photos with a seed for more consistent 1970s-style imagery
        const imageId = Math.floor(Math.random() * 1000) + 1;
        return `https://picsum.photos/id/${imageId}/${width}/${height}?grayscale&blur=1`;
    }

    generatePosterLayout() {
        const format = Math.random() < 0.6 ? 'letter' : 'spread'; // 60% letter, 40% spread
        const hasImage = Math.random() < 0.75; // 75% have images, 25% are type/graphic only
        const redElement = this.getRandomElement(['title', 'subtitle', 'accent', 'background-element', 'geometric-shape']);
        const breakGrid = Math.random() < 0.4; // 40% break the grid
        const geometricShape = this.getRandomElement(['square', 'rectangle', 'triangle', 'circle']);
        const boldDesign = Math.random() < 0.3; // 30% are crazy bold designs
        const coloredBackground = Math.random() < 0.25; // 25% have colored backgrounds
        const backgroundType = this.getRandomElement(['black', 'red', 'dark-gray', 'tinted']);
        const titleSpacing = this.getRandomElement(['tight', 'normal', 'loose', 'extreme']);
        const subtitleSpacing = this.getRandomElement(['tight', 'normal', 'loose']);
        const bodySpacing = this.getRandomElement(['tight', 'normal', 'loose']);
        
        const layouts = [
            // Standard layouts with images
            {
                format: format,
                hasImage: hasImage && !boldDesign,
                imagePosition: 'top',
                imageHeight: format === 'letter' ? '50%' : '45%',
                textAlign: 'left',
                accentPosition: 'bottom',
                redElement: redElement,
                breakGrid: breakGrid,
                layoutType: 'standard',
                geometricShape: geometricShape,
                boldDesign: boldDesign,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            {
                format: format,
                hasImage: hasImage && !boldDesign,
                imagePosition: 'top',
                imageHeight: format === 'letter' ? '60%' : '55%',
                textAlign: 'center',
                accentPosition: 'middle',
                redElement: redElement,
                breakGrid: breakGrid,
                layoutType: 'standard',
                geometricShape: geometricShape,
                boldDesign: boldDesign,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // Type-only layouts
            {
                format: format,
                hasImage: false,
                textAlign: 'center',
                accentPosition: 'none',
                redElement: redElement,
                breakGrid: breakGrid,
                layoutType: 'type-dominant',
                geometricShape: geometricShape,
                boldDesign: boldDesign,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            {
                format: format,
                hasImage: false,
                textAlign: 'left',
                accentPosition: 'vertical',
                redElement: redElement,
                breakGrid: breakGrid,
                layoutType: 'type-grid-break',
                geometricShape: geometricShape,
                boldDesign: boldDesign,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // Large type/graphic layouts
            {
                format: format,
                hasImage: false,
                textAlign: 'center',
                accentPosition: 'background',
                redElement: redElement,
                breakGrid: true,
                layoutType: 'large-type',
                geometricShape: geometricShape,
                boldDesign: boldDesign,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // Asymmetrical layouts
            {
                format: format,
                hasImage: hasImage && !boldDesign,
                imagePosition: 'side',
                imageHeight: '100%',
                textAlign: 'left',
                accentPosition: 'diagonal',
                redElement: redElement,
                breakGrid: breakGrid,
                layoutType: 'asymmetrical',
                geometricShape: geometricShape,
                boldDesign: boldDesign,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // BOLD NEW LAYOUTS
            // Geometric dominant
            {
                format: format,
                hasImage: false,
                textAlign: 'center',
                accentPosition: 'overlay',
                redElement: redElement,
                breakGrid: true,
                layoutType: 'geometric-dominant',
                geometricShape: geometricShape,
                boldDesign: true,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // Massive type with geometric
            {
                format: format,
                hasImage: false,
                textAlign: 'left',
                accentPosition: 'behind',
                redElement: redElement,
                breakGrid: true,
                layoutType: 'massive-type-geometric',
                geometricShape: geometricShape,
                boldDesign: true,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // Split screen bold
            {
                format: format,
                hasImage: false,
                textAlign: 'center',
                accentPosition: 'split',
                redElement: redElement,
                breakGrid: true,
                layoutType: 'split-screen-bold',
                geometricShape: geometricShape,
                boldDesign: true,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // Diagonal chaos
            {
                format: format,
                hasImage: false,
                textAlign: 'left',
                accentPosition: 'diagonal-chaos',
                redElement: redElement,
                breakGrid: true,
                layoutType: 'diagonal-chaos',
                geometricShape: geometricShape,
                boldDesign: true,
                coloredBackground: coloredBackground,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // IMAGE-DOMINANT LAYOUTS
            // Full-bleed image with text overlay
            {
                format: format,
                hasImage: true,
                imagePosition: 'full-bleed',
                imageHeight: '100%',
                textAlign: 'center',
                accentPosition: 'overlay',
                redElement: redElement,
                breakGrid: true,
                layoutType: 'image-dominant',
                geometricShape: geometricShape,
                boldDesign: false,
                coloredBackground: false,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // Large image with minimal text
            {
                format: format,
                hasImage: true,
                imagePosition: 'top',
                imageHeight: format === 'letter' ? '75%' : '70%',
                textAlign: 'left',
                accentPosition: 'bottom',
                redElement: redElement,
                breakGrid: false,
                layoutType: 'image-heavy',
                geometricShape: geometricShape,
                boldDesign: false,
                coloredBackground: false,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            },
            // Texture background with text
            {
                format: format,
                hasImage: true,
                imagePosition: 'texture-background',
                imageHeight: '100%',
                textAlign: 'center',
                accentPosition: 'none',
                redElement: redElement,
                breakGrid: false,
                layoutType: 'texture-background',
                geometricShape: geometricShape,
                boldDesign: false,
                coloredBackground: false,
                backgroundType: backgroundType,
                titleSpacing: titleSpacing,
                subtitleSpacing: subtitleSpacing,
                bodySpacing: bodySpacing
            }
        ];

        return this.getRandomElement(layouts);
    }

    generatePosterContent() {
        const theme = this.getRandomElement(this.posterThemes);
        
        // Use custom content if provided, otherwise use random
        const title = this.customContent.title || this.getRandomElement(this.greedText.titles);
        const subtitle = this.customContent.subtitle || this.getRandomElement(this.greedText.subtitles);
        const body = this.customContent.body || this.generateRandomText(15 + Math.floor(Math.random() * 10));
        const credits = this.customContent.credits || this.getRandomElement(this.greedText.credits);
        const date = this.customContent.date || this.getRandomElement(this.greedText.dates);
        const venue = this.customContent.venue || this.getRandomElement(this.greedText.venues);
        const copyright = this.customContent.copyright || this.getRandomElement(this.greedText.copyrights);
        
        // Variable type sizes - EXTREME EDITION
        const typeSizes = {
            titleSize: this.getRandomElement(['tiny', 'small', 'medium', 'large', 'xl', 'massive', 'gigantic', 'colossal', 'full-width']),
            subtitleSize: this.getRandomElement(['tiny', 'small', 'medium', 'large', 'xl', 'massive']),
            bodySize: this.getRandomElement(['tiny', 'small', 'medium', 'large']),
            metaSize: this.getRandomElement(['tiny', 'small', 'medium']) // For credits, date, venue, copyright
        };

        return {
            theme: theme.theme,
            title: title,
            subtitle: subtitle,
            body: body,
            credits: credits,
            date: date,
            venue: venue,
            copyright: copyright,
            typeSizes: typeSizes
        };
    }

    setCustomContent(title, subtitle, body, credits, date, venue, copyright) {
        this.customContent = {
            title: title.trim(),
            subtitle: subtitle.trim(),
            body: body.trim(),
            credits: credits.trim(),
            date: date.trim(),
            venue: venue.trim(),
            copyright: copyright.trim()
        };
    }

    async createPoster(index) {
        const posterDiv = document.createElement('div');
        posterDiv.className = 'poster';
        posterDiv.setAttribute('data-index', index);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'poster-content';

        const layout = this.generatePosterLayout();
        const content = this.generatePosterContent();
        
        // Apply format and layout classes
        posterDiv.classList.add(`format-${layout.format}`);
        posterDiv.classList.add(`layout-${layout.layoutType}`);
        
        if (layout.breakGrid) {
            posterDiv.classList.add('break-grid');
        }
        
        // Apply colored background if needed
        if (layout.coloredBackground) {
            posterDiv.classList.add(`bg-${layout.backgroundType}`);
        }

        // Create elements based on layout type
        if (layout.layoutType === 'type-dominant') {
            this.createTypeDominantPoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'type-grid-break') {
            this.createGridBreakPoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'large-type') {
            this.createLargeTypePoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'asymmetrical') {
            await this.createAsymmetricalPoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'geometric-dominant') {
            this.createGeometricDominantPoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'massive-type-geometric') {
            this.createMassiveTypeGeometricPoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'split-screen-bold') {
            this.createSplitScreenBoldPoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'diagonal-chaos') {
            this.createDiagonalChaosPoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'image-dominant') {
            await this.createImageDominantPoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'image-heavy') {
            await this.createImageHeavyPoster(contentDiv, layout, content);
        } else if (layout.layoutType === 'texture-background') {
            await this.createTextureBackgroundPoster(contentDiv, layout, content);
        } else {
            // Standard layout
            await this.createStandardPoster(contentDiv, layout, content);
        }

        posterDiv.appendChild(contentDiv);

        // Add click event for selection
        posterDiv.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectPoster(index);
        });

        return posterDiv;
    }

    addMetaElements(contentDiv, elements) {
        // Add meta elements (positioned absolutely in corners)
        contentDiv.appendChild(elements.credits);
        contentDiv.appendChild(elements.date);
        contentDiv.appendChild(elements.venue);
        contentDiv.appendChild(elements.copyright);
        
        // Add repeated title if it exists
        if (elements.repeatedTitle) {
            contentDiv.appendChild(elements.repeatedTitle);
        }
    }

    async createStandardPoster(contentDiv, layout, content) {
        // Create image element if needed
        if (layout.hasImage) {
            const imageElement = document.createElement('img');
            imageElement.className = 'poster-image';
            imageElement.style.height = layout.imageHeight;
            
            // Add texture and tinting effects
            const imageEffects = [
                'texture-grain',
                'texture-contrast',
                'texture-vintage',
                'tint-red-light',
                'tint-red-medium',
                'tint-red-heavy',
                'texture-multiply',
                'texture-overlay'
            ];
            
            const chosenEffect = this.getRandomElement(imageEffects);
            imageElement.classList.add(chosenEffect);
            
            try {
                const imageUrl = await this.getRandomImage();
                imageElement.src = imageUrl;
                imageElement.alt = `${content.theme} poster image`;
            } catch (error) {
                console.error('Failed to load image:', error);
                imageElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjFGMUYxIi8+CjxyZWN0IHg9IjE1MCIgeT0iMTI1IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMDAwMDAwIi8+Cjwvc3ZnPgo=';
            }
            contentDiv.appendChild(imageElement);
        }

        // Create text container
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text';
        textDiv.style.textAlign = layout.textAlign;

        // Create and style elements
        const elements = this.createTextElements(content, layout);
        
        // Assemble based on accent position
        if (layout.accentPosition === 'top') {
            textDiv.appendChild(elements.accent);
        }

        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        textDiv.appendChild(elements.body);

        if (layout.accentPosition === 'middle') {
            textDiv.appendChild(elements.accent);
        }

        if (layout.accentPosition === 'bottom') {
            textDiv.appendChild(elements.accent);
        }

        contentDiv.appendChild(textDiv);
        
        // Add meta elements (positioned absolutely in corners)
        contentDiv.appendChild(elements.credits);
        contentDiv.appendChild(elements.date);
        contentDiv.appendChild(elements.venue);
        contentDiv.appendChild(elements.copyright);
        
        // Add repeated title if it exists
        if (elements.repeatedTitle) {
            contentDiv.appendChild(elements.repeatedTitle);
        }
    }

    createTypeDominantPoster(contentDiv, layout, content) {
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text type-dominant';
        textDiv.style.textAlign = layout.textAlign;

        const elements = this.createTextElements(content, layout);
        
        // Large title takes center stage
        elements.title.style.fontSize = '3.5rem';
        elements.title.style.lineHeight = '0.9';
        elements.title.style.marginBottom = '2rem';
        
        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        textDiv.appendChild(elements.body);

        contentDiv.appendChild(textDiv);
        
        // Add meta elements (positioned absolutely in corners)
        contentDiv.appendChild(elements.credits);
        contentDiv.appendChild(elements.date);
        contentDiv.appendChild(elements.venue);
        contentDiv.appendChild(elements.copyright);
        
        // Add repeated title if it exists
        if (elements.repeatedTitle) {
            contentDiv.appendChild(elements.repeatedTitle);
        }
    }

    createGridBreakPoster(contentDiv, layout, content) {
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text grid-break';
        
        const elements = this.createTextElements(content, layout);
        
        // Break grid with diagonal or rotated text
        elements.title.style.transform = 'rotate(-5deg)';
        elements.title.style.fontSize = '2.5rem';
        elements.title.style.position = 'relative';
        elements.title.style.left = '10%';
        elements.title.style.marginBottom = '3rem';
        
        // Vertical accent
        if (layout.accentPosition === 'vertical') {
            elements.accent.style.width = '8px';
            elements.accent.style.height = '60%';
            elements.accent.style.position = 'absolute';
            elements.accent.style.right = '20px';
            elements.accent.style.top = '20px';
        }
        
        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        textDiv.appendChild(elements.body);
        textDiv.appendChild(elements.accent);

        contentDiv.appendChild(textDiv);
        
        // Add meta elements (positioned absolutely in corners)
        contentDiv.appendChild(elements.credits);
        contentDiv.appendChild(elements.date);
        contentDiv.appendChild(elements.venue);
        contentDiv.appendChild(elements.copyright);
        
        // Add repeated title if it exists
        if (elements.repeatedTitle) {
            contentDiv.appendChild(elements.repeatedTitle);
        }
    }

    createLargeTypePoster(contentDiv, layout, content) {
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text large-type';
        textDiv.style.textAlign = layout.textAlign;

        const elements = this.createTextElements(content, layout);
        
        // Massive title
        elements.title.style.fontSize = '4rem';
        elements.title.style.lineHeight = '0.8';
        elements.title.style.fontWeight = '900';
        elements.title.style.marginBottom = '1rem';
        
        // Background graphic element
        if (layout.accentPosition === 'background') {
            const backgroundElement = document.createElement('div');
            backgroundElement.className = 'background-graphic';
            backgroundElement.style.cssText = `
                position: absolute;
                top: 10%;
                left: 10%;
                width: 80%;
                height: 80%;
                background: ${layout.redElement === 'background-element' ? '#cc6660' : '#000000'};
                opacity: 0.1;
                z-index: 1;
            `;
            contentDiv.appendChild(backgroundElement);
        }
        
        textDiv.style.position = 'relative';
        textDiv.style.zIndex = '2';
        
        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        textDiv.appendChild(elements.body);

        contentDiv.appendChild(textDiv);
        
        // Add meta elements (positioned absolutely in corners)
        contentDiv.appendChild(elements.credits);
        contentDiv.appendChild(elements.date);
        contentDiv.appendChild(elements.venue);
        contentDiv.appendChild(elements.copyright);
        
        // Add repeated title if it exists
        if (elements.repeatedTitle) {
            contentDiv.appendChild(elements.repeatedTitle);
        }
    }

    async createAsymmetricalPoster(contentDiv, layout, content) {
        contentDiv.style.display = 'flex';
        
        if (layout.hasImage && layout.imagePosition === 'side') {
            const imageElement = document.createElement('img');
            imageElement.className = 'poster-image side-image';
            imageElement.style.width = '40%';
            imageElement.style.height = '100%';
            imageElement.style.objectFit = 'cover';
            
            // Add texture and tinting effects
            const imageEffects = [
                'texture-grain',
                'texture-contrast',
                'texture-vintage',
                'tint-red-light',
                'tint-red-medium',
                'tint-red-heavy',
                'texture-multiply',
                'texture-overlay'
            ];
            
            const chosenEffect = this.getRandomElement(imageEffects);
            imageElement.classList.add(chosenEffect);
            
            try {
                const imageUrl = await this.getRandomImage();
                imageElement.src = imageUrl;
                imageElement.alt = `${content.theme} poster image`;
            } catch (error) {
                console.error('Failed to load image:', error);
                imageElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjFGMUYxIi8+CjxyZWN0IHg9IjE1MCIgeT0iMTI1IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMDAwMDAwIi8+Cjwvc3ZnPgo=';
            }
            contentDiv.appendChild(imageElement);
        }

        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text asymmetrical';
        textDiv.style.width = layout.hasImage ? '60%' : '100%';
        textDiv.style.padding = '20px';

        const elements = this.createTextElements(content, layout);
        
        // Diagonal accent
        if (layout.accentPosition === 'diagonal') {
            elements.accent.style.transform = 'rotate(45deg)';
            elements.accent.style.width = '100px';
            elements.accent.style.height = '8px';
            elements.accent.style.position = 'absolute';
            elements.accent.style.top = '30%';
            elements.accent.style.right = '10%';
        }
        
        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        textDiv.appendChild(elements.body);
        textDiv.appendChild(elements.accent);

        contentDiv.appendChild(textDiv);
        
        // Add meta elements and repeated title
        this.addMetaElements(contentDiv, elements);
    }

    // NEW BOLD LAYOUT FUNCTIONS
    createGeometricDominantPoster(contentDiv, layout, content) {
        // Create massive geometric shape that takes up 60%+ of the poster
        const geometricElement = this.createGeometricShape(layout.geometricShape, layout.redElement);
        geometricElement.style.cssText += `
            position: absolute;
            top: 10%;
            left: 10%;
            width: 80%;
            height: 60%;
            z-index: 1;
        `;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text geometric-dominant';
        textDiv.style.cssText = `
            position: absolute;
            top: 75%;
            left: 5%;
            right: 5%;
            z-index: 100;
            text-align: center;
        `;

        const elements = this.createTextElements(content, layout);
        
        // Overlay text style - NO TEXT SHADOW as per requirements
        elements.title.style.fontSize = '3rem';
        elements.title.style.fontWeight = '900';
        
        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        
        contentDiv.appendChild(geometricElement);
        contentDiv.appendChild(textDiv);
        
        // Add meta elements and repeated title
        this.addMetaElements(contentDiv, elements);
    }

    createMassiveTypeGeometricPoster(contentDiv, layout, content) {
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text massive-type';
        textDiv.style.cssText = `
            position: relative;
            z-index: 100;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 20px;
        `;

        const elements = this.createTextElements(content, layout);
        
        // MASSIVE title that fills most of the poster
        elements.title.style.fontSize = '5rem';
        elements.title.style.fontWeight = '900';
        elements.title.style.lineHeight = '0.8';
        elements.title.style.textTransform = 'uppercase';
        elements.title.style.letterSpacing = '-2px';
        
        // Background geometric shape
        const geometricElement = this.createGeometricShape(layout.geometricShape, layout.redElement);
        geometricElement.style.cssText += `
            position: absolute;
            top: 20%;
            right: 10%;
            width: 40%;
            height: 40%;
            z-index: 1;
            opacity: 0.3;
        `;
        
        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        
        contentDiv.appendChild(geometricElement);
        contentDiv.appendChild(textDiv);
        
        // Add meta elements and repeated title
        this.addMetaElements(contentDiv, elements);
    }

    createSplitScreenBoldPoster(contentDiv, layout, content) {
        contentDiv.style.display = 'flex';
        
        // Left side - geometric shape
        const leftDiv = document.createElement('div');
        leftDiv.style.cssText = `
            width: 50%;
            height: 100%;
            position: relative;
            background: ${layout.redElement === 'geometric-shape' ? '#cc6660' : '#000000'};
        `;
        
        const geometricElement = this.createGeometricShape(layout.geometricShape, 'accent');
        geometricElement.style.cssText += `
            position: absolute;
            top: 20%;
            left: 20%;
            width: 60%;
            height: 60%;
            z-index: 2;
            background: #ffffff;
        `;
        
        // Right side - text
        const rightDiv = document.createElement('div');
        rightDiv.style.cssText = `
            width: 50%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 30px;
            background: #ffffff;
        `;

        const elements = this.createTextElements(content, layout);
        
        elements.title.style.fontSize = '3.5rem';
        elements.title.style.fontWeight = '900';
        elements.title.style.lineHeight = '0.9';
        
        leftDiv.appendChild(geometricElement);
        rightDiv.appendChild(elements.title);
        rightDiv.appendChild(elements.subtitle);
        rightDiv.appendChild(elements.body);
        
        contentDiv.appendChild(leftDiv);
        contentDiv.appendChild(rightDiv);
        
        // Add meta elements and repeated title
        this.addMetaElements(contentDiv, elements);
    }

    createDiagonalChaosPoster(contentDiv, layout, content) {
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text diagonal-chaos';
        textDiv.style.cssText = `
            position: relative;
            z-index: 100;
            height: 100%;
            padding: 20px;
        `;

        const elements = this.createTextElements(content, layout);
        
        // Diagonal title
        elements.title.style.cssText += `
            position: absolute;
            top: 20%;
            left: 10%;
            transform: rotate(-15deg);
            font-size: 4rem;
            font-weight: 900;
            line-height: 0.8;
            z-index: 100;
        `;
        
        // Multiple geometric shapes in chaos
        for (let i = 0; i < 3; i++) {
            const shape = this.createGeometricShape(
                this.getRandomElement(['square', 'rectangle', 'triangle', 'circle']),
                i === 0 ? layout.redElement : 'accent'
            );
            shape.style.cssText += `
                position: absolute;
                top: ${20 + i * 25}%;
                left: ${40 + i * 15}%;
                width: ${15 + i * 10}%;
                height: ${15 + i * 10}%;
                z-index: ${1 + i};
                opacity: 0.8;
                transform: rotate(${i * 30}deg);
            `;
            contentDiv.appendChild(shape);
        }
        
        // Subtitle in different position
        elements.subtitle.style.cssText += `
            position: absolute;
            bottom: 30%;
            right: 10%;
            transform: rotate(5deg);
            font-size: 1.5rem;
            z-index: 100;
        `;
        
        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        
        contentDiv.appendChild(textDiv);
        
        // Add meta elements and repeated title
        this.addMetaElements(contentDiv, elements);
    }

    // IMAGE-DOMINANT LAYOUTS
    async createImageDominantPoster(contentDiv, layout, content) {
        // Full-bleed image with text overlay
        const imageElement = document.createElement('img');
        imageElement.className = 'poster-image full-bleed';
        imageElement.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
        `;
        
        // Add texture/tinting effects
        const imageEffects = [
            'texture-grain',
            'texture-contrast',
            'texture-vintage',
            'tint-red-light',
            'tint-red-medium',
            'texture-multiply',
            'texture-overlay'
        ];
        
        const chosenEffect = this.getRandomElement(imageEffects);
        imageElement.classList.add(chosenEffect);
        
        try {
            const imageUrl = await this.getRandomImage();
            imageElement.src = imageUrl;
            imageElement.alt = `${content.theme} poster image`;
        } catch (error) {
            console.error('Failed to load image:', error);
        }
        
        // Create varied text overlay designs (NO TEXT SHADOWS)
        const overlayDesigns = [
            // 1. Corner text with colored background
            {
                position: 'top-left',
                backgroundType: 'solid',
                textColor: 'white',
                bgColor: 'rgba(0,0,0,0.85)',
                titleSize: '2.5rem',
                titleWeight: '700',
                subtitleColor: '#cc6660'
            },
            // 2. Bottom strip with gradient
            {
                position: 'bottom-full',
                backgroundType: 'gradient',
                textColor: 'white',
                bgColor: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                titleSize: '4rem',
                titleWeight: '900',
                subtitleColor: 'rgba(255,255,255,0.8)'
            },
            // 3. Centered with geometric shape background
            {
                position: 'center',
                backgroundType: 'geometric',
                textColor: 'white',
                bgColor: '#cc6660',
                titleSize: '3.5rem',
                titleWeight: '100',
                subtitleColor: 'rgba(255,255,255,0.9)'
            },
            // 4. Side text with vertical layout
            {
                position: 'left-vertical',
                backgroundType: 'strip',
                textColor: 'white',
                bgColor: 'rgba(204,102,96,0.9)',
                titleSize: '2rem',
                titleWeight: '800',
                subtitleColor: 'rgba(255,255,255,0.8)'
            },
            // 5. Top banner with full width
            {
                position: 'top-banner',
                backgroundType: 'solid',
                textColor: 'black',
                bgColor: 'rgba(255,255,255,0.95)',
                titleSize: '3rem',
                titleWeight: '900',
                subtitleColor: '#cc6660'
            },
            // 6. Diagonal text with angled background
            {
                position: 'diagonal',
                backgroundType: 'angled',
                textColor: 'white',
                bgColor: 'rgba(0,0,0,0.8)',
                titleSize: '2.8rem',
                titleWeight: '300',
                subtitleColor: '#cc6660'
            },
            // 7. Bottom right with circle background
            {
                position: 'bottom-right',
                backgroundType: 'circle',
                textColor: 'white',
                bgColor: 'rgba(204,102,96,0.9)',
                titleSize: '2.2rem',
                titleWeight: '700',
                subtitleColor: 'rgba(255,255,255,0.9)'
            },
            // 8. Full overlay with massive text
            {
                position: 'full-overlay',
                backgroundType: 'transparent',
                textColor: 'white',
                bgColor: 'rgba(0,0,0,0.3)',
                titleSize: '6rem',
                titleWeight: '900',
                subtitleColor: '#cc6660'
            },
            // 9. Scattered text placement
            {
                position: 'scattered',
                backgroundType: 'multiple',
                textColor: 'white',
                bgColor: 'rgba(204,102,96,0.8)',
                titleSize: '2.8rem',
                titleWeight: '400',
                subtitleColor: 'rgba(255,255,255,0.9)'
            }
        ];
        
        const chosenDesign = this.getRandomElement(overlayDesigns);
        
        // Create text overlay with chosen design
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text image-overlay';
        
        // Apply position-specific styles
        let baseStyles = `
            position: absolute;
            z-index: 200;
            color: ${chosenDesign.textColor};
        `;
        
        // Position and background styling
        switch (chosenDesign.position) {
            case 'top-left':
                baseStyles += `
                    top: 30px;
                    left: 30px;
                    padding: 25px;
                    background: ${chosenDesign.bgColor};
                    border-radius: 3px;
                    max-width: 40%;
                `;
                break;
                
            case 'bottom-full':
                baseStyles += `
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    padding: 40px 30px;
                    background: ${chosenDesign.bgColor};
                    text-align: center;
                `;
                break;
                
            case 'center':
                baseStyles += `
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 30px 40px;
                    background: ${chosenDesign.bgColor};
                    border-radius: 50%;
                    text-align: center;
                    max-width: 60%;
                `;
                break;
                
            case 'left-vertical':
                baseStyles += `
                    top: 50%;
                    left: 30px;
                    transform: translateY(-50%) rotate(-90deg);
                    transform-origin: center;
                    padding: 20px 30px;
                    background: ${chosenDesign.bgColor};
                    border-radius: 3px;
                    white-space: nowrap;
                `;
                break;
                
            case 'top-banner':
                baseStyles += `
                    top: 0;
                    left: 0;
                    width: 100%;
                    padding: 25px 30px;
                    background: ${chosenDesign.bgColor};
                    text-align: center;
                    border-bottom: 3px solid #cc6660;
                `;
                break;
                
            case 'diagonal':
                baseStyles += `
                    top: 20%;
                    right: -10%;
                    transform: rotate(12deg);
                    padding: 20px 50px;
                    background: ${chosenDesign.bgColor};
                    border-radius: 3px;
                    text-align: center;
                `;
                break;
                
            case 'bottom-right':
                baseStyles += `
                    bottom: 30px;
                    right: 30px;
                    padding: 25px;
                    background: ${chosenDesign.bgColor};
                    border-radius: 50%;
                    text-align: center;
                    max-width: 35%;
                `;
                break;
                
            case 'full-overlay':
                baseStyles += `
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: ${chosenDesign.bgColor};
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 40px;
                `;
                break;
                
            case 'scattered':
                baseStyles += `
                    top: 25%;
                    left: 15%;
                    padding: 20px 30px;
                    background: ${chosenDesign.bgColor};
                    border-radius: 3px;
                    transform: rotate(-3deg);
                    max-width: 50%;
                `;
                break;
        }
        
        textDiv.style.cssText = baseStyles;
        
        // Create text elements with design-specific styling
        const elements = this.createTextElements(content, layout);
        
        // Apply extreme font weight variations
        const titleWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
        const chosenWeight = this.getRandomElement(titleWeights);
        
        elements.title.style.fontSize = chosenDesign.titleSize;
        elements.title.style.fontWeight = chosenWeight;
        elements.title.style.color = chosenDesign.textColor;
        elements.title.style.lineHeight = '1.1';
        elements.title.style.margin = '0 0 10px 0';
        
        // Extreme tracking variations
        const trackingOptions = ['-0.05em', '-0.02em', '0', '0.02em', '0.05em', '0.1em'];
        elements.title.style.letterSpacing = this.getRandomElement(trackingOptions);
        
        elements.subtitle.style.fontSize = '1.4rem';
        elements.subtitle.style.color = chosenDesign.subtitleColor;
        elements.subtitle.style.fontWeight = '400';
        elements.subtitle.style.margin = '0';
        elements.subtitle.style.letterSpacing = '0.02em';
        
        // Add scattered subtitle for scattered design
        if (chosenDesign.position === 'scattered') {
            const scatteredSubtitle = document.createElement('div');
            scatteredSubtitle.className = 'poster-text scattered-subtitle';
            scatteredSubtitle.style.cssText = `
                position: absolute;
                top: 70%;
                right: 10%;
                padding: 15px 20px;
                background: rgba(255,255,255,0.9);
                color: #cc6660;
                font-size: 1.2rem;
                font-weight: 600;
                border-radius: 3px;
                transform: rotate(2deg);
                z-index: 201;
            `;
            scatteredSubtitle.textContent = content.subtitle;
            contentDiv.appendChild(scatteredSubtitle);
        }
        
        textDiv.appendChild(elements.title);
        if (chosenDesign.position !== 'scattered') {
            textDiv.appendChild(elements.subtitle);
        }
        
        contentDiv.appendChild(imageElement);
        contentDiv.appendChild(textDiv);
        
        // Add creative repeated title variations for full bleed
        const repeatOptions = [
            {
                type: 'edge-vertical',
                style: `
                    position: absolute;
                    right: 10px;
                    top: 20%;
                    transform: rotate(90deg);
                    transform-origin: center;
                    font-size: 1.8rem;
                    font-weight: 100;
                    color: rgba(255,255,255,0.6);
                    z-index: 199;
                    white-space: nowrap;
                `
            },
            {
                type: 'watermark',
                style: `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 8rem;
                    font-weight: 900;
                    color: rgba(255,255,255,0.1);
                    z-index: 2;
                    pointer-events: none;
                    white-space: nowrap;
                `
            },
            {
                type: 'corner-stack',
                style: `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 1rem;
                    font-weight: 300;
                    color: rgba(204,102,96,0.8);
                    z-index: 202;
                    line-height: 1.2;
                    text-align: right;
                `
            }
        ];
        
        if (Math.random() < 0.6) {
            const repeatChoice = this.getRandomElement(repeatOptions);
            const repeatElement = document.createElement('div');
            repeatElement.className = 'repeated-title';
            repeatElement.style.cssText = repeatChoice.style;
            
            if (repeatChoice.type === 'corner-stack') {
                repeatElement.innerHTML = content.title.split(' ').join('<br>');
            } else {
                repeatElement.textContent = content.title;
            }
            
            contentDiv.appendChild(repeatElement);
        }
        
        // Add meta elements
        this.addMetaElements(contentDiv, elements);
    }

    async createImageHeavyPoster(contentDiv, layout, content) {
        // Large image with minimal text
        const imageElement = document.createElement('img');
        imageElement.className = 'poster-image image-heavy';
        imageElement.style.height = layout.imageHeight;
        imageElement.style.width = '100%';
        imageElement.style.objectFit = 'cover';
        
        // Add texture/tinting effects
        const imageEffects = [
            'texture-grain',
            'texture-contrast',
            'texture-vintage',
            'tint-red-light',
            'tint-red-medium',
            'tint-red-heavy',
            'texture-multiply',
            'texture-overlay'
        ];
        
        const chosenEffect = this.getRandomElement(imageEffects);
        imageElement.classList.add(chosenEffect);
        
        try {
            const imageUrl = await this.getRandomImage();
            imageElement.src = imageUrl;
            imageElement.alt = `${content.theme} poster image`;
        } catch (error) {
            console.error('Failed to load image:', error);
        }
        
        // Minimal text area
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text image-minimal';
        textDiv.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            z-index: 200;
            background: rgba(255, 255, 255, 0.9);
            padding: 15px;
            border-radius: 2px;
        `;
        
        const elements = this.createTextElements(content, layout);
        elements.title.style.fontSize = '2rem';
        elements.title.style.marginBottom = '5px';
        elements.subtitle.style.fontSize = '1rem';
        elements.subtitle.style.marginBottom = '0';
        
        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        
        contentDiv.appendChild(imageElement);
        contentDiv.appendChild(textDiv);
        
        // Add meta elements and repeated title
        this.addMetaElements(contentDiv, elements);
    }

    async createTextureBackgroundPoster(contentDiv, layout, content) {
        // Image as texture background
        const imageElement = document.createElement('img');
        imageElement.className = 'poster-image texture-bg';
        imageElement.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
            opacity: 0.15;
        `;
        
        // Strong texture effect
        const textureEffects = ['texture-grain', 'texture-contrast', 'texture-multiply'];
        const chosenEffect = this.getRandomElement(textureEffects);
        imageElement.classList.add(chosenEffect);
        
        try {
            const imageUrl = await this.getRandomImage();
            imageElement.src = imageUrl;
            imageElement.alt = `${content.theme} poster image`;
        } catch (error) {
            console.error('Failed to load image:', error);
        }
        
        // Text over texture
        const textDiv = document.createElement('div');
        textDiv.className = 'poster-text texture-overlay';
        textDiv.style.cssText = `
            position: relative;
            z-index: 200;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 40px;
        `;
        
        const elements = this.createTextElements(content, layout);
        elements.title.style.fontSize = '4rem';
        elements.title.style.fontWeight = '100';
        elements.title.style.marginBottom = '20px';
        
        elements.subtitle.style.fontSize = '1.5rem';
        elements.subtitle.style.fontWeight = '400';
        elements.subtitle.style.marginBottom = '15px';
        
        elements.body.style.fontSize = '1rem';
        elements.body.style.lineHeight = '1.6';
        elements.body.style.maxWidth = '60%';
        
        textDiv.appendChild(elements.title);
        textDiv.appendChild(elements.subtitle);
        textDiv.appendChild(elements.body);
        
        contentDiv.appendChild(imageElement);
        contentDiv.appendChild(textDiv);
        
        // Add meta elements and repeated title
        this.addMetaElements(contentDiv, elements);
    }

    createGeometricShape(shape, colorElement) {
        const element = document.createElement('div');
        element.className = `geometric-shape ${shape}`;
        
        const isRed = colorElement === 'geometric-shape';
        const color = isRed ? '#cc6660' : '#000000';
        
        switch (shape) {
            case 'square':
                element.style.cssText = `
                    background: ${color};
                    width: 100%;
                    height: 100%;
                `;
                break;
            case 'rectangle':
                element.style.cssText = `
                    background: ${color};
                    width: 100%;
                    height: 100%;
                `;
                break;
            case 'triangle':
                element.style.cssText = `
                    width: 0;
                    height: 0;
                    border-left: 50% solid transparent;
                    border-right: 50% solid transparent;
                    border-bottom: 100% solid ${color};
                `;
                break;
            case 'circle':
                element.style.cssText = `
                    background: ${color};
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                `;
                break;
        }
        
        return element;
    }

    createTextElements(content, layout) {
        // Create title
        const titleElement = document.createElement('h2');
        titleElement.className = 'poster-title';
        titleElement.textContent = content.title;
        
        // Create subtitle
        const subtitleElement = document.createElement('h3');
        subtitleElement.className = 'poster-subtitle';
        subtitleElement.textContent = content.subtitle;
        
        // Create body text
        const bodyElement = document.createElement('p');
        bodyElement.className = 'poster-body';
        bodyElement.textContent = content.body;
        
        // Create metadata elements
        const creditsElement = document.createElement('div');
        creditsElement.className = 'poster-credits';
        creditsElement.textContent = content.credits;
        
        const dateElement = document.createElement('div');
        dateElement.className = 'poster-date';
        dateElement.textContent = content.date;
        
        const venueElement = document.createElement('div');
        venueElement.className = 'poster-venue';
        venueElement.textContent = content.venue;
        
        const copyrightElement = document.createElement('div');
        copyrightElement.className = 'poster-copyright';
        copyrightElement.textContent = content.copyright;
        
        // Create accent element
        const accentElement = document.createElement('div');
        accentElement.className = 'poster-accent';
        
        // Apply type sizes
        this.applyTypeSizes(titleElement, subtitleElement, bodyElement, creditsElement, dateElement, venueElement, copyrightElement, content.typeSizes);
        
        // Apply typography spacing classes
        titleElement.classList.add(`spacing-${layout.titleSpacing}`);
        subtitleElement.classList.add(`spacing-${layout.subtitleSpacing}`);
        bodyElement.classList.add(`spacing-${layout.bodySpacing}`);
        
        // Apply red element styling
        this.applyRedStyling(titleElement, subtitleElement, accentElement, layout.redElement);
        
        // Add title repeat for massive sizes that may go off-page - CONSIDERED DESIGN
        let repeatedTitle = null;
        if (['massive', 'gigantic', 'colossal', 'full-width'].includes(content.typeSizes.titleSize)) {
            repeatedTitle = document.createElement('h2');
            repeatedTitle.className = 'poster-title-repeat';
            repeatedTitle.textContent = content.title;
            
            // Randomly choose a considered placement and styling
            const repeatStyles = [
                // Vertical text on side
                {
                    position: 'absolute',
                    top: '20px',
                    right: '10px',
                    fontSize: '0.7rem',
                    fontWeight: '300',
                    color: '#000000',
                    writingMode: 'vertical-lr',
                    textOrientation: 'mixed',
                    letterSpacing: '0.1em',
                    lineHeight: '1.0',
                    textTransform: 'uppercase',
                    zIndex: '250',
                    opacity: '0.6'
                },
                // Rotated text in corner
                {
                    position: 'absolute',
                    bottom: '15px',
                    left: '10px',
                    fontSize: '0.6rem',
                    fontWeight: '700',
                    color: '#cc6660',
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'left bottom',
                    letterSpacing: '0.2em',
                    lineHeight: '1.0',
                    textTransform: 'uppercase',
                    zIndex: '250',
                    opacity: '0.8'
                },
                // Horizontal in top margin
                {
                    position: 'absolute',
                    top: '5px',
                    left: '20px',
                    fontSize: '0.5rem',
                    fontWeight: '400',
                    color: '#666666',
                    letterSpacing: '0.3em',
                    lineHeight: '1.0',
                    textTransform: 'uppercase',
                    zIndex: '250',
                    opacity: '0.7'
                },
                // Diagonal text
                {
                    position: 'absolute',
                    top: '30px',
                    right: '30px',
                    fontSize: '0.8rem',
                    fontWeight: '900',
                    color: '#000000',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'center',
                    letterSpacing: '-0.05em',
                    lineHeight: '1.0',
                    textTransform: 'uppercase',
                    zIndex: '250',
                    opacity: '0.5'
                },
                // Bottom edge subtle
                {
                    position: 'absolute',
                    bottom: '8px',
                    right: '20px',
                    fontSize: '0.45rem',
                    fontWeight: '200',
                    color: '#999999',
                    letterSpacing: '0.4em',
                    lineHeight: '1.0',
                    textTransform: 'uppercase',
                    zIndex: '250',
                    opacity: '0.6'
                },
                // Integrated with background geometry
                {
                    position: 'absolute',
                    top: '50%',
                    left: '5px',
                    fontSize: '0.6rem',
                    fontWeight: '100',
                    color: '#cc6660',
                    transform: 'translateY(-50%) rotate(-90deg)',
                    transformOrigin: 'center',
                    letterSpacing: '0.15em',
                    lineHeight: '1.0',
                    textTransform: 'uppercase',
                    zIndex: '250',
                    opacity: '0.4'
                }
            ];
            
            const chosenStyle = this.getRandomElement(repeatStyles);
            Object.assign(repeatedTitle.style, chosenStyle);
            
            // Ensure it doesn't interfere with main content
            repeatedTitle.style.pointerEvents = 'none';
            repeatedTitle.style.userSelect = 'none';
        }
        
        return {
            title: titleElement,
            subtitle: subtitleElement,
            body: bodyElement,
            credits: creditsElement,
            date: dateElement,
            venue: venueElement,
            copyright: copyrightElement,
            accent: accentElement,
            repeatedTitle: repeatedTitle
        };
    }

    applyTypeSizes(titleElement, subtitleElement, bodyElement, creditsElement, dateElement, venueElement, copyrightElement, typeSizes) {
        // Title sizes - EXTREME EDITION
        const titleSizes = {
            'tiny': '0.6rem',
            'small': '1.2rem',
            'medium': '1.8rem',
            'large': '2.4rem',
            'xl': '3.2rem',
            'massive': '4.5rem',
            'gigantic': '8rem',
            'colossal': '12rem',
            'full-width': '15rem'
        };
        
        // Subtitle sizes - EXTREME EDITION
        const subtitleSizes = {
            'tiny': '0.5rem',
            'small': '0.8rem',
            'medium': '1.0rem',
            'large': '1.4rem',
            'xl': '2.0rem',
            'massive': '3.0rem'
        };
        
        // Body sizes - EXTREME EDITION
        const bodySizes = {
            'tiny': '0.4rem',
            'small': '0.6rem',
            'medium': '0.8rem',
            'large': '1.0rem'
        };
        
        // Meta element sizes (credits, date, venue, copyright)
        const metaSizes = {
            'tiny': '0.3rem',
            'small': '0.5rem',
            'medium': '0.7rem'
        };
        
        titleElement.style.fontSize = titleSizes[typeSizes.titleSize];
        subtitleElement.style.fontSize = subtitleSizes[typeSizes.subtitleSize];
        bodyElement.style.fontSize = bodySizes[typeSizes.bodySize];
        
        // Apply meta element sizes
        const metaSize = metaSizes[typeSizes.metaSize];
        creditsElement.style.fontSize = metaSize;
        dateElement.style.fontSize = metaSize;
        venueElement.style.fontSize = metaSize;
        copyrightElement.style.fontSize = metaSize;
        
        // EXTREME font weight and tracking variations
        const extremeWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
        const extremeTrackings = {
            'tiny': '0.3em',      // Way out for tiny
            'small': '0.2em',     // Out for small
            'medium': '0.1em',    // Slightly out for medium
            'large': '-0.05em',   // Slightly in for large
            'xl': '-0.1em',       // In for xl
            'massive': '-0.15em', // Way in for massive
            'gigantic': '-0.2em', // Extremely in for gigantic
            'colossal': '-0.25em', // Insanely in for colossal
            'full-width': '-0.3em' // Ridiculously in for full-width
        };
        
        // Apply extreme font weight (random for each poster)
        const randomWeight = extremeWeights[Math.floor(Math.random() * extremeWeights.length)];
        titleElement.style.fontWeight = randomWeight;
        
        // Apply extreme tracking based on size
        titleElement.style.letterSpacing = extremeTrackings[typeSizes.titleSize] || '0px';
        
        // Extreme titles need special handling
        if (['massive', 'gigantic', 'colossal', 'full-width'].includes(typeSizes.titleSize)) {
            titleElement.style.lineHeight = '0.8';
            
            // Super thin or super thick for massive sizes
            const massiveWeights = ['100', '200', '800', '900'];
            titleElement.style.fontWeight = massiveWeights[Math.floor(Math.random() * massiveWeights.length)];
        }
        
        // GIGANTIC and larger need even more extreme styling
        if (['gigantic', 'colossal', 'full-width'].includes(typeSizes.titleSize)) {
            titleElement.style.lineHeight = '0.7';
            titleElement.style.position = 'relative';
            titleElement.style.zIndex = '100';
            titleElement.style.display = 'block';
            titleElement.style.width = '100%';
            titleElement.style.margin = '0';
            titleElement.style.padding = '0';
            titleElement.style.overflowWrap = 'break-word';
            titleElement.style.wordBreak = 'break-all';
            
            // Ultra extreme weights for gigantic sizes
            const giganticWeights = ['100', '900'];
            titleElement.style.fontWeight = giganticWeights[Math.floor(Math.random() * giganticWeights.length)];
        }
        
        // COLOSSAL and FULL-WIDTH need the most extreme styling
        if (['colossal', 'full-width'].includes(typeSizes.titleSize)) {
            titleElement.style.lineHeight = '0.6';
            
            // Only the most extreme weights
            const colossalWeights = ['100', '900'];
            titleElement.style.fontWeight = colossalWeights[Math.floor(Math.random() * colossalWeights.length)];
        }
        
        // FULL-WIDTH gets the most insane treatment
        if (typeSizes.titleSize === 'full-width') {
            titleElement.style.lineHeight = '0.5';
            titleElement.style.textAlign = 'center';
            titleElement.style.transform = 'scale(1.2)';
            titleElement.style.transformOrigin = 'center center';
            titleElement.style.fontSize = 'clamp(8rem, 20vw, 15rem)';
            
            // Only ultra-thin or ultra-thick for full-width
            titleElement.style.fontWeight = Math.random() < 0.5 ? '100' : '900';
        }
    }

    applyRedStyling(titleElement, subtitleElement, accentElement, redElement) {
        // Reset all to black first
        titleElement.style.color = '#000000';
        subtitleElement.style.color = '#000000';
        accentElement.style.background = '#000000';
        
        // Apply red to chosen element (using beige-tinted red)
        switch (redElement) {
            case 'title':
                titleElement.style.color = '#cc6660';
                break;
            case 'subtitle':
                subtitleElement.style.color = '#cc6660';
                break;
            case 'accent':
                accentElement.style.background = '#cc6660';
                break;
            // background-element is handled in createLargeTypePoster
        }
    }

    selectPoster(index) {
        // Remove selection from all posters
        const allPosters = document.querySelectorAll('.poster');
        allPosters.forEach(poster => poster.classList.remove('selected'));
        
        // Select the clicked poster
        const selectedPoster = this.currentPosters[index];
        selectedPoster.classList.add('selected');
        
        // Update status bar
        this.updateStatusBar(index);
        
        // Show lightbox
        this.showLightbox(index);
    }

    updateStatusBar(index) {
        const statusElement = document.getElementById('selection-status');
        const exportButton = document.getElementById('export-btn');
        
        if (index >= 0 && index < this.currentPosters.length) {
            const posterData = this.getPosterData(index);
            statusElement.textContent = `Selected: ${posterData.title}`;
            exportButton.disabled = false;
            exportButton.setAttribute('data-poster-index', index);
        } else {
            statusElement.textContent = 'Click a poster to select';
            exportButton.disabled = true;
            exportButton.removeAttribute('data-poster-index');
        }
    }

    showLightbox(index) {
        const lightbox = document.getElementById('lightbox');
        const lightboxPoster = document.getElementById('lightbox-poster');
        
        // Clone the selected poster
        const originalPoster = this.currentPosters[index];
        const clonedPoster = originalPoster.cloneNode(true);
        
        // Remove selection class from clone and scale it appropriately
        clonedPoster.classList.remove('selected');
        clonedPoster.style.transform = 'scale(1.2)';
        clonedPoster.style.maxWidth = '600px';
        clonedPoster.style.maxHeight = '800px';
        
        // Clear and add the cloned poster
        lightboxPoster.innerHTML = '';
        lightboxPoster.appendChild(clonedPoster);
        
        // Show lightbox
        lightbox.classList.add('active');
    }

    hideLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
    }

    async generateAllPosters() {
        const posterGrid = document.getElementById('poster-grid');
        posterGrid.innerHTML = '';
        this.currentPosters = [];

        const posterPromises = [];
        for (let i = 0; i < this.posterCount; i++) {
            posterPromises.push(this.createPoster(i));
        }

        try {
            const posters = await Promise.all(posterPromises);
            posters.forEach((poster, index) => {
                posterGrid.appendChild(poster);
                this.currentPosters.push(poster);
            });
        } catch (error) {
            console.error('Error generating posters:', error);
        }
    }

    toggleGrid(showGrid) {
        const posters = document.querySelectorAll('.poster');
        posters.forEach(poster => {
            if (showGrid) {
                poster.classList.add('show-grid');
            } else {
                poster.classList.remove('show-grid');
            }
        });
    }

    getPosterData(index) {
        const poster = this.currentPosters[index];
        if (!poster) return null;

        const titleElement = poster.querySelector('.poster-title');
        const subtitleElement = poster.querySelector('.poster-subtitle');
        const bodyElement = poster.querySelector('.poster-body');
        const imageElement = poster.querySelector('.poster-image');
        
        const title = titleElement ? titleElement.textContent : '';
        const subtitle = subtitleElement ? subtitleElement.textContent : '';
        const body = bodyElement ? bodyElement.textContent : '';
        const imageUrl = imageElement ? imageElement.src : null;

        return {
            title,
            subtitle,
            body,
            imageUrl,
            element: poster
        };
    }
}

// Initialize the poster generator
const posterGenerator = new PosterGenerator(); 