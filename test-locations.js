/**
 * Test Locations for Ainthinai Classification
 * Reference cities from India and USA for each region
 */

const testLocations = {
    // NEITHAL (Coastal) - நெய்தல்
    neithal: [
        // India
        { name: "Chennai, India", lat: 13.0827, lon: 80.2707, country: "India" },
        { name: "Mumbai, India", lat: 19.0760, lon: 72.8777, country: "India" },
        { name: "Kochi, India", lat: 9.9312, lon: 76.2673, country: "India" },
        { name: "Visakhapatnam, India", lat: 17.6869, lon: 83.2185, country: "India" },
        { name: "Goa, India", lat: 15.2993, lon: 74.1240, country: "India" },

        // USA
        { name: "Miami, USA", lat: 25.7617, lon: -80.1918, country: "USA" },
        { name: "San Diego, USA", lat: 32.7157, lon: -117.1611, country: "USA" },
        { name: "Honolulu, USA", lat: 21.3099, lon: -157.8581, country: "USA" },
        { name: "Charleston, USA", lat: 32.7765, lon: -79.9311, country: "USA" },
        { name: "Santa Monica, USA", lat: 34.0195, lon: -118.4912, country: "USA" }
    ],

    // KURINJI (Mountains) - குறிஞ்சி
    kurinji: [
        // India
        { name: "Leh, Ladakh, India", lat: 34.1526, lon: 77.5771, country: "India" },
        { name: "Shimla, India", lat: 31.1048, lon: 77.1734, country: "India" },
        { name: "Manali, India", lat: 32.2396, lon: 77.1887, country: "India" },
        { name: "Darjeeling, India", lat: 27.0410, lon: 88.2663, country: "India" },
        { name: "Ooty, India", lat: 11.4102, lon: 76.6950, country: "India" },

        // USA
        { name: "Denver, USA", lat: 39.7392, lon: -104.9903, country: "USA" },
        { name: "Aspen, USA", lat: 39.1911, lon: -106.8175, country: "USA" },
        { name: "Jackson Hole, USA", lat: 43.4799, lon: -110.7624, country: "USA" },
        { name: "Flagstaff, USA", lat: 35.1983, lon: -111.6513, country: "USA" },
        { name: "Salt Lake City, USA", lat: 40.7608, lon: -111.8910, country: "USA" }
    ],

    // MULLAI (Forest/Pastoral) - முல்லை
    mullai: [
        // India
        { name: "Coorg, India", lat: 12.3375, lon: 75.8069, country: "India" },
        { name: "Munnar, India", lat: 10.0889, lon: 77.0595, country: "India" },
        { name: "Wayanad, India", lat: 11.6854, lon: 76.1320, country: "India" },
        { name: "Pachmarhi, India", lat: 22.4676, lon: 78.4376, country: "India" },
        { name: "Shillong, India", lat: 25.5788, lon: 91.8933, country: "India" },

        // USA
        { name: "Asheville, USA", lat: 35.5951, lon: -82.5515, country: "USA" },
        { name: "Bend, Oregon, USA", lat: 44.0582, lon: -121.3153, country: "USA" },
        { name: "Chattanooga, USA", lat: 35.0456, lon: -85.3097, country: "USA" },
        { name: "Gatlinburg, USA", lat: 35.7143, lon: -83.5102, country: "USA" },
        { name: "Sedona, USA", lat: 34.8697, lon: -111.7610, country: "USA" }
    ],

    // MARUDHAM (Plains) - மருதம்
    marudham: [
        // India
        { name: "Delhi, India", lat: 28.7041, lon: 77.1025, country: "India" },
        { name: "Patna, India", lat: 25.5941, lon: 85.1376, country: "India" },
        { name: "Lucknow, India", lat: 26.8467, lon: 80.9462, country: "India" },
        { name: "Chandigarh, India", lat: 30.7333, lon: 76.7794, country: "India" },
        { name: "Varanasi, India", lat: 25.3176, lon: 82.9739, country: "India" },

        // USA
        { name: "Kansas City, USA", lat: 39.0997, lon: -94.5786, country: "USA" },
        { name: "Omaha, USA", lat: 41.2565, lon: -95.9345, country: "USA" },
        { name: "Des Moines, USA", lat: 41.6005, lon: -93.6091, country: "USA" },
        { name: "Indianapolis, USA", lat: 39.7684, lon: -86.1581, country: "USA" },
        { name: "Memphis, USA", lat: 35.1495, lon: -90.0490, country: "USA" }
    ],

    // PAALAI (Arid/Desert) - பாலை
    paalai: [
        // India
        { name: "Jaisalmer, India", lat: 26.9157, lon: 70.9083, country: "India" },
        { name: "Bikaner, India", lat: 28.0229, lon: 73.3119, country: "India" },
        { name: "Jodhpur, India", lat: 26.2389, lon: 73.0243, country: "India" },
        { name: "Barmer, India", lat: 25.7521, lon: 71.3962, country: "India" },
        { name: "Leh (lower regions), India", lat: 34.1526, lon: 77.5771, country: "India" },

        // USA
        { name: "Phoenix, USA", lat: 33.4484, lon: -112.0740, country: "USA" },
        { name: "Las Vegas, USA", lat: 36.1699, lon: -115.1398, country: "USA" },
        { name: "Tucson, USA", lat: 32.2226, lon: -110.9747, country: "USA" },
        { name: "Palm Springs, USA", lat: 33.8303, lon: -116.5453, country: "USA" },
        { name: "Albuquerque, USA", lat: 35.0844, lon: -106.6504, country: "USA" }
    ]
};

/**
 * Run classification tests
 */
async function runTests() {
    console.log('🧪 Running Ainthinai Classification Tests...\n');

    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        failures: []
    };

    for (const [expectedRegion, locations] of Object.entries(testLocations)) {
        console.log(`\n📍 Testing ${expectedRegion.toUpperCase()} locations:`);
        console.log('─'.repeat(60));

        for (const location of locations) {
            results.total++;

            try {
                // Classify the location
                const result = await TerrainAnalyzer.classifyLocation(location.lat, location.lon);
                const actualRegion = result.region;

                const passed = actualRegion.toLowerCase() === expectedRegion.toLowerCase();

                if (passed) {
                    results.passed++;
                    console.log(`✅ ${location.name}`);
                    console.log(`   Expected: ${expectedRegion} | Got: ${actualRegion}`);
                    console.log(`   Elevation: ${result.terrainData.elevation.toFixed(0)}m, ` +
                              `Coast: ${result.terrainData.coastDistance.toFixed(0)}km, ` +
                              `Precip: ${result.terrainData.precipitation.toFixed(0)}mm`);
                } else {
                    results.failed++;
                    results.failures.push({
                        location: location.name,
                        expected: expectedRegion,
                        actual: actualRegion,
                        data: result.terrainData
                    });
                    console.log(`❌ ${location.name}`);
                    console.log(`   Expected: ${expectedRegion} | Got: ${actualRegion} ⚠️`);
                    console.log(`   Elevation: ${result.terrainData.elevation.toFixed(0)}m, ` +
                              `Coast: ${result.terrainData.coastDistance.toFixed(0)}km, ` +
                              `Precip: ${result.terrainData.precipitation.toFixed(0)}mm`);
                }
            } catch (error) {
                results.failed++;
                results.failures.push({
                    location: location.name,
                    expected: expectedRegion,
                    error: error.message
                });
                console.log(`❌ ${location.name} - ERROR: ${error.message}`);
            }

            // Small delay to respect API rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    // Print summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed} (${(results.passed/results.total*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${results.failed} (${(results.failed/results.total*100).toFixed(1)}%)`);

    if (results.failures.length > 0) {
        console.log('\n⚠️  FAILURES:');
        results.failures.forEach(failure => {
            console.log(`  - ${failure.location}`);
            console.log(`    Expected: ${failure.expected}, Got: ${failure.actual || 'ERROR'}`);
            if (failure.error) {
                console.log(`    Error: ${failure.error}`);
            }
        });
    }

    console.log('\n' + '═'.repeat(60));

    return results;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testLocations = testLocations;
    window.runAinthinaiTests = runTests;

    console.log('🧪 Test locations loaded!');
    console.log('Run tests by calling: runAinthinaiTests()');
}
