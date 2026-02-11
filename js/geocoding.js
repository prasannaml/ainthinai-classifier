/**
 * Geocoding Module
 * Handles conversion of address/location text to coordinates
 */

const Geocoding = {
    /**
     * Last request timestamp for rate limiting
     */
    lastRequestTime: 0,

    /**
     * Minimum delay between requests (in milliseconds)
     * Nominatim requires max 1 request per second
     */
    MIN_REQUEST_DELAY: 1000,

    /**
     * Geocode an address or location name to coordinates
     * Returns {lat, lon, displayName}
     */
    async geocode(address) {
        // Validate input
        if (!address || address.trim() === '') {
            throw new Error('Please enter a location');
        }

        // Ensure we don't exceed rate limits
        await this.enforceRateLimit();

        try {
            const result = await APIClient.geocodeAddress(address.trim());
            return result;
        } catch (error) {
            throw this.handleGeocodingError(error);
        }
    },

    /**
     * Enforce rate limiting for API requests
     */
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.MIN_REQUEST_DELAY) {
            const waitTime = this.MIN_REQUEST_DELAY - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    },

    /**
     * Handle geocoding errors and return user-friendly messages
     */
    handleGeocodingError(error) {
        let userMessage = 'Unable to find that location';

        if (error.message.includes('not found')) {
            userMessage = 'Location not found. Please try:\n' +
                '• A major city name (e.g., "Tokyo", "Paris")\n' +
                '• A landmark (e.g., "Eiffel Tower")\n' +
                '• A full address\n' +
                '• Coordinates (e.g., "13.08, 80.27")';
        } else if (error.message.includes('unavailable')) {
            userMessage = 'Geocoding service is temporarily unavailable. Please try again in a moment.';
        } else if (error.message.includes('enter a location')) {
            userMessage = 'Please enter a location to search.';
        }

        return {
            name: 'GeocodingError',
            message: error.message,
            userMessage: userMessage
        };
    },

    /**
     * Validate if a string looks like coordinates
     * Supports formats like: "13.08, 80.27" or "13.08 80.27"
     */
    looksLikeCoordinates(input) {
        // Remove extra whitespace
        const clean = input.trim();

        // Pattern: two numbers separated by comma or space
        // Latitude: -90 to 90, Longitude: -180 to 180
        const coordPattern = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
        return coordPattern.test(clean);
    },

    /**
     * Parse coordinate string to lat/lon
     */
    parseCoordinates(input) {
        const clean = input.trim();
        const coordPattern = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
        const match = clean.match(coordPattern);

        if (!match) {
            throw new Error('Invalid coordinate format');
        }

        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);

        // Validate ranges
        if (lat < -90 || lat > 90) {
            throw new Error('Latitude must be between -90 and 90');
        }

        if (lon < -180 || lon > 180) {
            throw new Error('Longitude must be between -180 and 180');
        }

        return { lat, lon };
    },

    /**
     * Search for a location - handles both place names and coordinates
     */
    async search(input, onLoading) {
        try {
            if (onLoading) {
                onLoading('Searching for location...');
            }

            // Check if input looks like coordinates
            if (this.looksLikeCoordinates(input)) {
                const coords = this.parseCoordinates(input);

                if (onLoading) {
                    onLoading('Coordinates found! Analyzing terrain...');
                }

                return {
                    lat: coords.lat,
                    lon: coords.lon,
                    displayName: `${coords.lat}, ${coords.lon}`
                };
            }

            // Otherwise, geocode the address
            if (onLoading) {
                onLoading('Looking up location...');
            }

            const result = await this.geocode(input);

            if (onLoading) {
                onLoading('Location found! Analyzing terrain...');
            }

            return result;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get search suggestions (optional feature for autocomplete)
     * This could be implemented in the future
     */
    async getSuggestions(query) {
        // Placeholder for autocomplete functionality
        // Could use Nominatim's search with more results
        return [];
    },

    /**
     * Clean and normalize location input
     */
    normalizeInput(input) {
        return input
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[^\w\s,.-]/g, ''); // Remove special characters except comma, period, hyphen
    }
};
