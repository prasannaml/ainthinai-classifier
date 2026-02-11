/**
 * Geolocation Module
 * Handles browser geolocation API for automatic location detection
 */

const GeoLocation = {
    /**
     * Timeout for geolocation request (in milliseconds)
     */
    TIMEOUT: 10000, // 10 seconds

    /**
     * Check if geolocation is supported by the browser
     */
    isSupported() {
        return 'geolocation' in navigator;
    },

    /**
     * Get current position using browser geolocation API
     * Returns a promise that resolves with {lat, lon} or rejects with error
     */
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            // Check if geolocation is supported
            if (!this.isSupported()) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            // Options for geolocation
            const options = {
                enableHighAccuracy: true, // Request high accuracy
                timeout: this.TIMEOUT,
                maximumAge: 0 // Don't use cached position
            };

            // Request current position
            navigator.geolocation.getCurrentPosition(
                // Success callback
                (position) => {
                    const result = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(result);
                },
                // Error callback
                (error) => {
                    reject(this.handleGeolocationError(error));
                },
                options
            );
        });
    },

    /**
     * Handle geolocation errors and return user-friendly error messages
     */
    handleGeolocationError(error) {
        let message = 'Unable to get your location';
        let userMessage = '';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Location permission denied';
                userMessage = 'You denied location access. Please use the manual input option below or enable location permissions in your browser settings.';
                break;

            case error.POSITION_UNAVAILABLE:
                message = 'Location information unavailable';
                userMessage = 'Your location could not be determined. Please check your device settings or use the manual input option.';
                break;

            case error.TIMEOUT:
                message = 'Location request timed out';
                userMessage = 'Location request took too long. Please try again or use the manual input option.';
                break;

            default:
                message = 'Unknown geolocation error';
                userMessage = 'An error occurred while getting your location. Please try the manual input option.';
                break;
        }

        // Return error object with both technical and user-friendly messages
        return {
            name: 'GeolocationError',
            code: error.code,
            message: message,
            userMessage: userMessage
        };
    },

    /**
     * Request location with loading callback
     * Useful for updating UI during the request
     */
    async requestLocation(onLoading) {
        try {
            if (onLoading) {
                onLoading('Requesting location permission...');
            }

            const position = await this.getCurrentPosition();

            if (onLoading) {
                onLoading('Location acquired! Analyzing terrain...');
            }

            return position;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Format coordinates for display
     */
    formatCoordinates(lat, lon) {
        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';

        const latAbs = Math.abs(lat).toFixed(4);
        const lonAbs = Math.abs(lon).toFixed(4);

        return `${latAbs}°${latDir}, ${lonAbs}°${lonDir}`;
    },

    /**
     * Get approximate location name using reverse geocoding
     * This is optional and can be used to show location name
     */
    async getLocationName(lat, lon) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?` +
                `lat=${lat}&lon=${lon}&` +
                `format=json&` +
                `zoom=10`;

            // Respect Nominatim's usage policy
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Ainthinai-Classifier-App'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.display_name || 'Unknown location';
            }

            return 'Unknown location';
        } catch (error) {
            console.error('Error getting location name:', error);
            return 'Unknown location';
        }
    }
};
