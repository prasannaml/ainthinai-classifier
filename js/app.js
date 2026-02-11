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
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
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

            // Get current position
            const position = await GeoLocation.requestLocation((message) => {
                this.updateLoadingMessage(message);
            });

            // Classify the location
            await this.classifyAndDisplay(position.lat, position.lon);
        } catch (error) {
            console.error('Geolocation error:', error);
            this.showError(
                'Location Access Failed',
                error.userMessage || error.message
            );
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

            // Search for location (handles both addresses and coordinates)
            const result = await Geocoding.search(locationText, (message) => {
                this.updateLoadingMessage(message);
            });

            // Classify the location
            await this.classifyAndDisplay(result.lat, result.lon, result.displayName);
        } catch (error) {
            console.error('Search error:', error);
            this.showError(
                'Location Search Failed',
                error.userMessage || error.message
            );
        }
    },

    /**
     * Classify location and display results
     */
    async classifyAndDisplay(lat, lon, displayName = null) {
        try {
            this.updateLoadingMessage('Analyzing terrain characteristics...');

            // Get classification
            const result = await TerrainAnalyzer.classifyLocation(lat, lon);

            // Get location name if not provided
            if (!displayName) {
                this.updateLoadingMessage('Getting location details...');
                displayName = await GeoLocation.getLocationName(lat, lon);
            }

            // Display results
            this.showResults(result, displayName);
        } catch (error) {
            console.error('Classification error:', error);
            this.showError(
                'Classification Failed',
                error.message || 'Unable to analyze this location. Please try another one.'
            );
        }
    },

    /**
     * Display classification results
     */
    showResults(result, locationName) {
        const { region, regionData, terrainData, coordinates } = result;

        // Hide other sections
        this.hideAllSections();

        // Populate result card
        const regionIcon = document.getElementById('region-icon');
        const regionNameEl = document.getElementById('region-name');
        const regionTamil = document.getElementById('region-tamil');
        const regionEnglish = document.getElementById('region-english');
        const regionDesc = document.getElementById('region-description');
        const charList = document.getElementById('characteristics-list');
        const locationCoords = document.getElementById('location-coords');

        if (regionIcon) regionIcon.textContent = regionData.icon || '';
        if (regionNameEl) regionNameEl.textContent = region;
        if (regionTamil) regionTamil.textContent = regionData.tamil || '';
        if (regionEnglish) regionEnglish.textContent = regionData.english || '';
        if (regionDesc) regionDesc.textContent = regionData.description || '';

        // Populate characteristics
        if (charList && regionData.characteristics) {
            charList.innerHTML = regionData.characteristics
                .map(char => `<li>${char}</li>`)
                .join('');
        }

        // Populate terrain parameters
        const formatted = TerrainAnalyzer.formatTerrainData(terrainData);
        const elevationEl = document.getElementById('param-elevation');
        const coastEl = document.getElementById('param-coast');
        const precipEl = document.getElementById('param-precipitation');

        if (elevationEl) elevationEl.textContent = formatted.elevation;
        if (coastEl) coastEl.textContent = formatted.coastDistance;
        if (precipEl) precipEl.textContent = formatted.precipitation;

        // Display location
        if (locationCoords) {
            const coordsText = GeoLocation.formatCoordinates(coordinates.lat, coordinates.lon);
            locationCoords.textContent = `${locationName || 'Your location'} (${coordsText})`;
        }

        // Set region color theme
        const resultCard = document.getElementById('result-card');
        if (resultCard && regionData.color) {
            resultCard.style.borderTopColor = regionData.color;
            regionNameEl.style.color = regionData.color;
        }

        // Show results section
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

        const errorSection = document.getElementById('error-section');
        const errorTitle = document.getElementById('error-title');
        const errorMessage = document.getElementById('error-message');

        if (errorTitle) errorTitle.textContent = title;
        if (errorMessage) errorMessage.textContent = message;
        if (errorSection) {
            errorSection.classList.remove('hidden');
            errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    /**
     * Reset to input view
     */
    resetToInput() {
        this.hideAllSections();

        const inputSection = document.getElementById('input-section');
        if (inputSection) {
            inputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Clear input
        const locationInput = document.getElementById('location-input');
        if (locationInput) locationInput.value = '';
    },

    /**
     * Hide all dynamic sections (loading, results, error)
     */
    hideAllSections() {
        const sections = [
            'loading-section',
            'results-section',
            'error-section'
        ];

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.classList.add('hidden');
        });
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
