/**
 * API Client Module
 * Handles all external API calls for terrain data
 */

const APIClient = {
    // Cache configuration
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // Initial retry delay in ms

    /**
     * Get elevation for coordinates using Open-Meteo Elevation API
     */
    async getElevation(lat, lon) {
        const cacheKey = `elevation_${lat}_${lon}`;
        const cached = this.getFromCache(cacheKey);
        if (cached !== null) return cached;

        const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;

        try {
            const data = await this.fetchWithRetry(url);
            if (data && data.elevation && Array.isArray(data.elevation)) {
                const elevation = data.elevation[0];
                this.saveToCache(cacheKey, elevation);
                return elevation;
            }
            throw new Error('Invalid elevation data format');
        } catch (error) {
            console.error('Error fetching elevation:', error);
            throw new Error('Failed to get elevation data');
        }
    },

    /**
     * Get annual precipitation using Open-Meteo Climate API
     * Uses data from the previous year
     */
    async getAnnualPrecipitation(lat, lon) {
        const cacheKey = `precipitation_${lat}_${lon}`;
        const cached = this.getFromCache(cacheKey);
        if (cached !== null) return cached;

        // Get data from previous full year
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - 1); // Yesterday
        const startDate = new Date(endDate);
        startDate.setFullYear(startDate.getFullYear() - 1); // One year ago

        const formatDate = (date) => date.toISOString().split('T')[0];

        const url = `https://archive-api.open-meteo.com/v1/archive?` +
            `latitude=${lat}&longitude=${lon}&` +
            `start_date=${formatDate(startDate)}&` +
            `end_date=${formatDate(endDate)}&` +
            `daily=precipitation_sum`;

        try {
            const data = await this.fetchWithRetry(url);
            if (data && data.daily && data.daily.precipitation_sum) {
                // Sum up all daily precipitation values
                const totalPrecipitation = data.daily.precipitation_sum.reduce((sum, val) => {
                    return sum + (val || 0);
                }, 0);

                this.saveToCache(cacheKey, totalPrecipitation);
                return totalPrecipitation;
            }
            throw new Error('Invalid precipitation data format');
        } catch (error) {
            console.error('Error fetching precipitation:', error);
            // Return a default value for areas without precipitation data
            // This could happen in some remote areas or oceans
            return 500; // Assume moderate rainfall if data unavailable
        }
    },

    /**
     * Calculate distance to nearest coastline
     * Uses Haversine formula with a simplified set of coastal boundary points
     */
    async getCoastDistance(lat, lon) {
        const cacheKey = `coast_${lat}_${lon}`;
        const cached = this.getFromCache(cacheKey);
        if (cached !== null) return cached;

        // Simplified approach: Check distance to major water bodies
        // For a production app, you'd use a more comprehensive coastline dataset

        // Sample coastal reference points (major oceans and seas)
        const coastalPoints = this.getCoastalReferencePoints();

        let minDistance = Infinity;

        for (const point of coastalPoints) {
            const distance = this.haversineDistance(lat, lon, point.lat, point.lon);
            minDistance = Math.min(minDistance, distance);
        }

        this.saveToCache(cacheKey, minDistance);
        return minDistance;
    },

    /**
     * Get coastal reference points
     * Dense grid of coastal points for accurate distance calculation
     */
    getCoastalReferencePoints() {
        const points = [];

        // MAJOR INDIAN COASTAL CITIES (explicit points for accuracy)
        const indianCoastalCities = [
            { lat: 13.08, lon: 80.27 },   // Chennai
            { lat: 11.93, lon: 79.83 },   // Puducherry
            { lat: 8.09, lon: 77.54 },    // Kanyakumari
            { lat: 9.93, lon: 76.27 },    // Kochi
            { lat: 11.25, lon: 75.78 },   // Kozhikode
            { lat: 12.87, lon: 74.84 },   // Mangalore
            { lat: 15.30, lon: 73.99 },   // Goa (Panaji)
            { lat: 19.08, lon: 72.88 },   // Mumbai
            { lat: 18.97, lon: 72.82 },   // Navi Mumbai
            { lat: 21.17, lon: 72.83 },   // Surat
            { lat: 17.69, lon: 83.22 },   // Visakhapatnam
            { lat: 20.27, lon: 85.83 },   // Bhubaneswar (near coast)
            { lat: 22.57, lon: 88.36 },   // Kolkata
        ];
        points.push(...indianCoastalCities);

        // DETAILED INDIAN SUBCONTINENT COASTLINE (every 0.5 degree)
        // West coast of India (Arabian Sea) - Dense grid
        for (let lat = 8; lat <= 23; lat += 0.5) {
            points.push({ lat, lon: 68 + (lat - 8) * 0.3 }); // Gujarat to Kerala
        }

        // South coast of India (Indian Ocean) - Very dense
        for (let lon = 76; lon <= 81; lon += 0.3) {
            points.push({ lat: 8 + Math.sin(lon - 76) * 0.5, lon }); // Kerala to Tamil Nadu
        }

        // East coast of India (Bay of Bengal) - CHENNAI IS HERE - Very dense!
        for (let lat = 8; lat <= 22; lat += 0.3) {
            points.push({ lat, lon: 80.1 + (lat - 8) * 0.1 }); // Tamil Nadu to Odisha
        }

        // Sri Lanka coastline
        for (let lat = 6; lat <= 10; lat += 0.5) {
            points.push({ lat, lon: 80 }); // East coast
            points.push({ lat, lon: 79.5 }); // West coast
        }

        // Bangladesh coast
        for (let lat = 21; lat <= 23; lat += 0.5) {
            points.push({ lat, lon: 90 });
        }

        // Southeast Asia (Thailand, Malaysia, Vietnam)
        for (let lat = 1; lat <= 20; lat += 1) {
            points.push({ lat, lon: 100 }); // Thailand/Vietnam
            points.push({ lat, lon: 105 }); // Vietnam
        }
        for (let lat = 1; lat <= 7; lat += 0.5) {
            points.push({ lat, lon: 103 }); // Malaysia
        }

        // NORTH AMERICA
        // East Coast (Atlantic)
        for (let lat = 25; lat <= 45; lat += 1.5) {
            points.push({ lat, lon: -80 + (lat - 25) * 0.5 }); // Florida to Maine
        }

        // West Coast (Pacific)
        for (let lat = 32; lat <= 49; lat += 1.5) {
            points.push({ lat, lon: -117 - (lat - 32) * 0.2 }); // California to Washington
        }

        // Gulf of Mexico
        for (let lon = -97; lon <= -80; lon += 2) {
            points.push({ lat: 29, lon }); // Texas to Florida
        }

        // SOUTH AMERICA
        // East Coast (Atlantic)
        for (let lat = -35; lat <= 5; lat += 2) {
            points.push({ lat, lon: -35 - lat * 0.3 }); // Argentina to Brazil
        }

        // West Coast (Pacific)
        for (let lat = -55; lat <= 0; lat += 2) {
            points.push({ lat, lon: -70 }); // Chile to Ecuador
        }

        // EUROPE
        // Western Europe (Atlantic)
        for (let lat = 36; lat <= 60; lat += 1.5) {
            points.push({ lat, lon: -5 - (lat - 36) * 0.2 }); // Spain to UK
        }

        // Mediterranean
        for (let lon = -5; lon <= 36; lon += 2) {
            points.push({ lat: 35 + Math.sin(lon * 0.1) * 5, lon }); // Mediterranean curve
        }

        // AFRICA
        // West Coast (Atlantic)
        for (let lat = -35; lat <= 35; lat += 2) {
            points.push({ lat, lon: 10 + Math.abs(lat) * 0.15 }); // South Africa to Morocco
        }

        // East Coast (Indian Ocean)
        for (let lat = -35; lat <= 10; lat += 2) {
            points.push({ lat, lon: 35 + lat * 0.3 }); // South Africa to Somalia
        }

        // EAST ASIA
        // China coast
        for (let lat = 18; lat <= 40; lat += 1.5) {
            points.push({ lat, lon: 115 + lat * 0.2 }); // Hainan to Liaoning
        }

        // Japan
        for (let lat = 30; lat <= 45; lat += 1) {
            points.push({ lat, lon: 135 + (lat - 30) * 0.5 }); // Kyushu to Hokkaido
            points.push({ lat, lon: 139 + (lat - 30) * 0.3 }); // East coast
        }

        // Korea
        for (let lat = 34; lat <= 39; lat += 1) {
            points.push({ lat, lon: 126 }); // West coast
            points.push({ lat, lon: 129 }); // East coast
        }

        // AUSTRALIA
        // East coast
        for (let lat = -38; lat <= -10; lat += 2) {
            points.push({ lat, lon: 145 + lat * 0.2 }); // Victoria to Queensland
        }

        // West coast
        for (let lat = -35; lat <= -15; lat += 2) {
            points.push({ lat, lon: 115 }); // Perth to northwest
        }

        // MIDDLE EAST
        // Persian Gulf
        for (let lat = 24; lat <= 30; lat += 1) {
            points.push({ lat, lon: 50 }); // UAE to Kuwait
        }

        // Red Sea
        for (let lat = 12; lat <= 28; lat += 1.5) {
            points.push({ lat, lon: 37 }); // East coast
            points.push({ lat, lon: 40 }); // West coast
        }

        // POLAR REGIONS
        // Arctic Ocean (every 5 degrees)
        for (let lon = -180; lon <= 180; lon += 5) {
            points.push({ lat: 70, lon });
        }

        // Antarctica (every 5 degrees)
        for (let lon = -180; lon <= 180; lon += 5) {
            points.push({ lat: -65, lon });
        }

        // ISLANDS & ADDITIONAL POINTS
        // Indonesia
        for (let lat = -8; lat <= 6; lat += 1) {
            for (let lon = 95; lon <= 140; lon += 3) {
                if ((lat >= -6 && lat <= 6 && lon >= 95 && lon <= 141)) {
                    points.push({ lat, lon });
                }
            }
        }

        // Caribbean
        for (let lat = 10; lat <= 25; lat += 2) {
            for (let lon = -85; lon <= -60; lon += 2) {
                points.push({ lat, lon });
            }
        }

        // New Zealand
        points.push({ lat: -41, lon: 174 });
        points.push({ lat: -37, lon: 174 });
        points.push({ lat: -45, lon: 170 });

        return points;
    },

    /**
     * Calculate distance between two points using Haversine formula
     * Returns distance in kilometers
     */
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    },

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Geocode an address to coordinates using Nominatim
     */
    async geocodeAddress(address) {
        if (!address || address.trim() === '') {
            throw new Error('Please enter a location');
        }

        const url = `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(address)}&` +
            `format=json&` +
            `limit=1`;

        try {
            // Respect Nominatim's usage policy (1 request per second)
            await this.sleep(1000);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Ainthinai-Classifier-App'
                }
            });

            if (!response.ok) {
                throw new Error('Geocoding service unavailable');
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                throw new Error('Location not found. Please try a different search term.');
            }

            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        } catch (error) {
            console.error('Error geocoding address:', error);
            throw error;
        }
    },

    /**
     * Fetch with retry logic and exponential backoff
     */
    async fetchWithRetry(url, retries = this.MAX_RETRIES) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                const isLastAttempt = attempt === retries - 1;

                if (isLastAttempt) {
                    throw error;
                }

                // Exponential backoff
                const delay = this.RETRY_DELAY * Math.pow(2, attempt);
                console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
                await this.sleep(delay);
            }
        }
    },

    /**
     * Sleep/delay function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Get data from localStorage cache
     */
    getFromCache(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const { value, timestamp } = JSON.parse(item);
            const now = Date.now();

            // Check if cache is still valid
            if (now - timestamp < this.CACHE_DURATION) {
                return value;
            }

            // Cache expired, remove it
            localStorage.removeItem(key);
            return null;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    },

    /**
     * Save data to localStorage cache
     */
    saveToCache(key, value) {
        try {
            const item = {
                value,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
            console.error('Cache write error:', error);
            // Continue without caching if localStorage is full or unavailable
        }
    }
};
