/**
 * Terrain Analyzer Module
 * Classifies locations into Ainthinai regions based on terrain characteristics
 */

const TerrainAnalyzer = {
    /**
     * Classification thresholds
     */
    THRESHOLDS: {
        COASTAL_DISTANCE: 50, // km
        HIGH_ELEVATION: 1000, // meters
        MID_ELEVATION_MIN: 200, // meters
        LOW_ELEVATION: 200, // meters
        LOW_PRECIPITATION: 250 // mm/year
    },

    /**
     * Load region metadata from JSON file
     */
    async loadRegionData() {
        try {
            const response = await fetch('data/regions.json');
            if (!response.ok) {
                throw new Error('Failed to load region data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading region data:', error);
            // Return minimal fallback data
            return {
                Kurinji: { tamil: 'குறிஞ்சி', english: 'Mountainous Region' },
                Mullai: { tamil: 'முல்லை', english: 'Forest & Pastoral Region' },
                Marudham: { tamil: 'மருதம்', english: 'Agricultural Plains' },
                Neithal: { tamil: 'நெய்தல்', english: 'Coastal Region' },
                Paalai: { tamil: 'பாலை', english: 'Arid & Desert Region' }
            };
        }
    },

    /**
     * Main classification function
     * Returns the Ainthinai region based on terrain characteristics
     *
     * Priority order: Neithal → Kurinji → Paalai → Mullai → Marudham
     */
    async classifyLocation(lat, lon) {
        try {
            // Fetch all terrain data in parallel for efficiency
            const [elevation, coastDistance, precipitation] = await Promise.all([
                APIClient.getElevation(lat, lon),
                APIClient.getCoastDistance(lat, lon),
                APIClient.getAnnualPrecipitation(lat, lon)
            ]);

            // Apply classification rules in priority order
            const region = this.applyClassificationRules(elevation, coastDistance, precipitation);

            // Load detailed region information
            const regionData = await this.loadRegionData();

            return {
                region,
                regionData: regionData[region],
                terrainData: {
                    elevation,
                    coastDistance,
                    precipitation
                },
                coordinates: { lat, lon }
            };
        } catch (error) {
            console.error('Error classifying location:', error);
            throw new Error('Failed to analyze terrain. Please try again.');
        }
    },

    /**
     * Apply classification rules based on terrain parameters
     */
    applyClassificationRules(elevation, coastDistance, precipitation) {
        const T = this.THRESHOLDS;

        // 1. NEITHAL (Coastal) - Highest Priority
        // Close to coast and low elevation
        if (coastDistance <= T.COASTAL_DISTANCE && elevation < T.LOW_ELEVATION) {
            return 'Neithal';
        }

        // 2. KURINJI (Mountains) - Second Priority
        // High elevation and not coastal
        if (elevation >= T.HIGH_ELEVATION && coastDistance > T.COASTAL_DISTANCE) {
            return 'Kurinji';
        }

        // 3. PAALAI (Arid/Desert) - Third Priority
        // Low precipitation, not mountainous, not coastal
        if (
            precipitation < T.LOW_PRECIPITATION &&
            elevation < T.HIGH_ELEVATION &&
            coastDistance > T.COASTAL_DISTANCE
        ) {
            return 'Paalai';
        }

        // 4. MULLAI (Forest/Pastoral) - Fourth Priority
        // Mid-altitude, adequate rainfall, inland
        if (
            elevation >= T.MID_ELEVATION_MIN &&
            elevation < T.HIGH_ELEVATION &&
            precipitation >= T.LOW_PRECIPITATION &&
            coastDistance > T.COASTAL_DISTANCE
        ) {
            return 'Mullai';
        }

        // 5. MARUDHAM (Plains) - Default
        // Low elevation, adequate rainfall, not coastal
        if (
            elevation < T.LOW_ELEVATION &&
            precipitation >= T.LOW_PRECIPITATION &&
            coastDistance > T.COASTAL_DISTANCE
        ) {
            return 'Marudham';
        }

        // Fallback: If none of the above match perfectly, use best fit
        return this.getBestFitRegion(elevation, coastDistance, precipitation);
    },

    /**
     * Get best fit region when no perfect match exists
     * This handles edge cases and ambiguous classifications
     */
    getBestFitRegion(elevation, coastDistance, precipitation) {
        const T = this.THRESHOLDS;

        // If very close to coast (even if slightly higher elevation), it's likely Neithal
        if (coastDistance <= T.COASTAL_DISTANCE * 1.5) {
            return 'Neithal';
        }

        // If very high elevation, it's likely Kurinji
        if (elevation >= T.HIGH_ELEVATION * 0.8) {
            return 'Kurinji';
        }

        // If very dry, it's likely Paalai
        if (precipitation < T.LOW_PRECIPITATION * 1.2) {
            return 'Paalai';
        }

        // If mid-altitude, it's likely Mullai
        if (elevation >= T.MID_ELEVATION_MIN * 0.8 && elevation < T.HIGH_ELEVATION) {
            return 'Mullai';
        }

        // Default to Marudham (most common/general type)
        return 'Marudham';
    },

    /**
     * Format terrain data for display
     */
    formatTerrainData(terrainData) {
        return {
            elevation: this.formatElevation(terrainData.elevation),
            coastDistance: this.formatDistance(terrainData.coastDistance),
            precipitation: this.formatPrecipitation(terrainData.precipitation)
        };
    },

    /**
     * Format elevation for display
     */
    formatElevation(meters) {
        if (meters < 0) return 'Below sea level';
        if (meters < 1000) return `${Math.round(meters)} m`;
        return `${(meters / 1000).toFixed(2)} km`;
    },

    /**
     * Format distance for display
     */
    formatDistance(km) {
        if (km < 1) return `${Math.round(km * 1000)} m`;
        if (km < 100) return `${Math.round(km)} km`;
        return `${Math.round(km / 10) * 10} km`;
    },

    /**
     * Format precipitation for display
     */
    formatPrecipitation(mm) {
        return `${Math.round(mm)} mm/year`;
    },

    /**
     * Get explanation for why a location was classified as a specific region
     */
    getClassificationExplanation(region, terrainData) {
        const { elevation, coastDistance, precipitation } = terrainData;
        const T = this.THRESHOLDS;

        const reasons = [];

        switch (region) {
            case 'Neithal':
                reasons.push(`Within ${T.COASTAL_DISTANCE}km of the coast`);
                reasons.push(`Low elevation (${this.formatElevation(elevation)})`);
                break;

            case 'Kurinji':
                reasons.push(`High elevation (${this.formatElevation(elevation)})`);
                reasons.push('Mountainous terrain');
                break;

            case 'Paalai':
                reasons.push(`Low annual rainfall (${this.formatPrecipitation(precipitation)})`);
                reasons.push('Arid conditions');
                break;

            case 'Mullai':
                reasons.push(`Mid-altitude elevation (${this.formatElevation(elevation)})`);
                reasons.push('Adequate rainfall for vegetation');
                reasons.push('Inland location');
                break;

            case 'Marudham':
                reasons.push(`Low elevation (${this.formatElevation(elevation)})`);
                reasons.push('Adequate rainfall for agriculture');
                reasons.push('Fertile plains');
                break;
        }

        return reasons;
    }
};
