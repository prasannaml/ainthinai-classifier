/**
 * Main Application Controller
 * Coordinates the Ainthinai classification workflow
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        console.log('Ainthinai Classifier initialized');
        this.setupEventListeners();
        this.checkGeolocationSupport();
        HistoryModule.render();
        this.handleUrlParams();
    },

    /**
     * Handle ?lat= &lon= or ?q= URL params for shareable links
     */
    async handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const lat = params.get('lat');
        const lon = params.get('lon');
        const q = params.get('q');

        if (lat && lon) {
            const parsedLat = parseFloat(lat);
            const parsedLon = parseFloat(lon);
            if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
                setTimeout(() => this.classifyAndDisplay(parsedLat, parsedLon), 400);
            }
        } else if (q) {
            const input = document.getElementById('location-input');
            if (input) {
                input.value = decodeURIComponent(q);
                setTimeout(() => this.handleSearch(), 400);
            }
        }
    },

    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Detect location button
        const detectBtn = document.getElementById('detect-location-btn');
        if (detectBtn) {
            detectBtn.addEventListener('click', () => this.handleDetectLocation());
        }

        // Search button
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }

        // Location input - allow Enter key to search
        const locationInput = document.getElementById('location-input');
        if (locationInput) {
            locationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
        }

        // Try another location button
        const tryAnotherBtn = document.getElementById('try-another-btn');
        if (tryAnotherBtn) {
            tryAnotherBtn.addEventListener('click', () => this.resetToInput());
        }

        // Error retry button
        const errorRetryBtn = document.getElementById('error-retry-btn');
        if (errorRetryBtn) {
            errorRetryBtn.addEventListener('click', () => this.resetToInput());
        }

        // Share buttons
        document.getElementById('share-twitter-btn')?.addEventListener('click', () => ShareModule.shareOnTwitter());
        document.getElementById('share-copy-btn')?.addEventListener('click', () => ShareModule.copyLink());
        document.getElementById('share-image-btn')?.addEventListener('click', () => ShareModule.downloadAsImage());
    },

    /**
     * Check if geolocation is supported and update UI
     */
    checkGeolocationSupport() {
        if (!GeoLocation.isSupported()) {
            const detectBtn = document.getElementById('detect-location-btn');
            if (detectBtn) {
                detectBtn.disabled = true;
                detectBtn.innerHTML = '<span>⚠️</span><span>Location Not Supported</span>';
                detectBtn.title = 'Your browser does not support geolocation';
            }
        }
    },

    /**
     * Handle detect location button click
     */
    async handleDetectLocation() {
        try {
            this.showLoading('Requesting location permission...');
            const position = await GeoLocation.requestLocation((message) => {
                this.updateLoadingMessage(message);
            });
            await this.classifyAndDisplay(position.lat, position.lon);
        } catch (error) {
            console.error('Geolocation error:', error);
            this.showError('Location Access Failed', error.userMessage || error.message);
        }
    },

    /**
     * Handle manual location search
     */
    async handleSearch() {
        const input = document.getElementById('location-input');
        const locationText = input ? input.value : '';

        if (!locationText || locationText.trim() === '') {
            this.showError('Input Required', 'Please enter a location to search.');
            return;
        }

        try {
            this.showLoading('Searching for location...');
            const result = await Geocoding.search(locationText, (message) => {
                this.updateLoadingMessage(message);
            });
            await this.classifyAndDisplay(result.lat, result.lon, result.displayName);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Location Search Failed', error.userMessage || error.message);
        }
    },

    /**
     * Classify location and display results
     */
    async classifyAndDisplay(lat, lon, displayName = null) {
        try {
            this.updateLoadingMessage('Analyzing terrain characteristics...');
            const result = await TerrainAnalyzer.classifyLocation(lat, lon);

            if (!displayName) {
                this.updateLoadingMessage('Getting location details...');
                displayName = await GeoLocation.getLocationName(lat, lon);
            }

            this.showResults(result, displayName);
        } catch (error) {
            console.error('Classification error:', error);
            this.showError('Classification Failed', error.message || 'Unable to analyze this location. Please try another one.');
        }
    },

    /**
     * Display classification results
     */
    showResults(result, locationName) {
        const { region, regionData, terrainData, coordinates } = result;

        this.hideAllSections();

        // Apply region theme to body
        document.body.setAttribute('data-region', region);

        // Region header
        const regionIcon = document.getElementById('region-icon');
        const regionNameEl = document.getElementById('region-name');
        const regionTamil = document.getElementById('region-tamil');
        const regionEnglish = document.getElementById('region-english');
        const regionDesc = document.getElementById('region-description');
        const emotionBadge = document.getElementById('emotion-badge');

        if (regionIcon) regionIcon.textContent = regionData.icon || '';
        if (regionNameEl) {
            regionNameEl.textContent = region;
            regionNameEl.style.color = regionData.color || '';
        }
        if (regionTamil) regionTamil.textContent = regionData.tamil || '';
        if (regionEnglish) regionEnglish.textContent = regionData.english || '';
        if (regionDesc) regionDesc.textContent = regionData.description || '';

        // Emotion badge
        if (emotionBadge && regionData.emotionEnglish) {
            emotionBadge.innerHTML = `
                <span class="emotion-tamil">${regionData.emotion || ''}</span>
                <span class="emotion-english">${regionData.emotionEnglish}</span>
            `;
        }

        // Characteristics
        const charList = document.getElementById('characteristics-list');
        if (charList && regionData.characteristics) {
            charList.innerHTML = regionData.characteristics
                .map(char => `<li>${char}</li>`)
                .join('');
        }

        // Terrain parameters (with count-up animation)
        const formatted = TerrainAnalyzer.formatTerrainData(terrainData);
        this.animateValue('param-elevation', formatted.elevation);
        this.animateValue('param-coast', formatted.coastDistance);
        this.animateValue('param-precipitation', formatted.precipitation);

        // Result card border color
        const resultCard = document.getElementById('result-card');
        if (resultCard && regionData.color) {
            resultCard.style.borderTopColor = regionData.color;
            // Apply CSS variable for region color
            resultCard.style.setProperty('--region-color', regionData.color);
        }

        // Poem section
        const poem = regionData.poem;
        if (poem) {
            const poemTamil = document.getElementById('poem-tamil');
            const poemTranslation = document.getElementById('poem-translation');
            const poemSource = document.getElementById('poem-source');
            if (poemTamil) poemTamil.textContent = poem.tamil || '';
            if (poemTranslation) poemTranslation.textContent = poem.translation || '';
            if (poemSource) poemSource.textContent = `— ${poem.source}${poem.poet ? ', ' + poem.poet : ''}`;

            const poemSection = document.getElementById('poem-section');
            if (poemSection) poemSection.style.borderLeftColor = regionData.color || '';
        }

        // Location coords
        const locationCoords = document.getElementById('location-coords');
        if (locationCoords) {
            const coordsText = GeoLocation.formatCoordinates(coordinates.lat, coordinates.lon);
            locationCoords.textContent = `${locationName || 'Your location'} (${coordsText})`;
        }

        // Share module context
        ShareModule.setContext(region, locationName, coordinates.lat, coordinates.lon);

        // Save to history
        HistoryModule.save(
            locationName || `${coordinates.lat.toFixed(2)}, ${coordinates.lon.toFixed(2)}`,
            region,
            regionData.icon || '📍',
            regionData.color || '#818cf8',
            coordinates.lat,
            coordinates.lon
        );

        // Show results section
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Render map after results are visible
        setTimeout(() => {
            if (typeof MapView !== 'undefined') {
                MapView.render(coordinates.lat, coordinates.lon, region, regionData.color || '#818cf8');
            }
        }, 400);
    },

    /**
     * Animate a value display with a pop-in effect
     */
    animateValue(elementId, displayValue) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'scale(0.8)';
        el.textContent = displayValue;
        requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
        });
    },

    /**
     * Show loading state
     */
    showLoading(message) {
        this.hideAllSections();
        const loadingSection = document.getElementById('loading-section');
        const loadingText = document.getElementById('loading-subtext');
        if (loadingText) loadingText.textContent = message || '';
        if (loadingSection) loadingSection.classList.remove('hidden');
    },

    /**
     * Update loading message
     */
    updateLoadingMessage(message) {
        const loadingText = document.getElementById('loading-subtext');
        if (loadingText) loadingText.textContent = message || '';
    },

    /**
     * Show error state
     */
    showError(title, message) {
        this.hideAllSections();
        document.body.removeAttribute('data-region');

        const errorSection = document.getElementById('error-section');
        const errorTitle = document.getElementById('error-title');
        const errorMessage = document.getElementById('error-message');

        if (errorTitle) errorTitle.textContent = title;
        if (errorMessage) errorMessage.textContent = message;
        if (errorSection) {
            errorSection.classList.remove('hidden');
            errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Auto-focus the input after error for better UX
            setTimeout(() => {
                document.getElementById('location-input')?.focus();
            }, 600);
        }
    },

    /**
     * Reset to input view
     */
    resetToInput() {
        this.hideAllSections();
        document.body.removeAttribute('data-region');
        MapView.destroy?.();

        const inputSection = document.getElementById('input-section');
        if (inputSection) {
            inputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const locationInput = document.getElementById('location-input');
        if (locationInput) {
            locationInput.value = '';
            locationInput.focus();
        }
    },

    /**
     * Hide all dynamic sections
     */
    hideAllSections() {
        ['loading-section', 'results-section', 'error-section'].forEach(id => {
            document.getElementById(id)?.classList.add('hidden');
        });
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
