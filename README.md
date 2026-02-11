# Ainthinai Classifier 🏔️🌊🌾

A web application that classifies any global location into one of the five Tamil Sangam Ainthinai regions based on terrain characteristics.

## What is Ainthinai?

**Ainthinai (ஐந்திணை)** is an ancient Tamil classification system from classical Sangam literature that divides the world into five geographical regions, each with unique landscapes, climates, and cultural significance:

- **Kurinji (குறிஞ்சி)** - Mountainous regions
- **Mullai (முல்லை)** - Forests and pastoral lands
- **Marudham (மருதம்)** - Agricultural plains
- **Neithal (நெய்தல்)** - Coastal areas
- **Paalai (பாலை)** - Arid and desert regions

## How It Works

This tool analyzes three key terrain characteristics:

1. **Elevation** - Height above sea level
2. **Distance to Coast** - Proximity to the nearest coastline
3. **Precipitation** - Annual rainfall amount

Based on these parameters, it classifies the location using a priority-based algorithm:

### Classification Criteria

| Region | Elevation | Coast Distance | Precipitation |
|--------|-----------|----------------|---------------|
| **Neithal** (Coastal) | < 200m | ≤ 50 km | Any |
| **Kurinji** (Mountains) | ≥ 1000m | > 50 km | Any |
| **Paalai** (Arid) | < 1000m | > 50 km | < 250 mm/year |
| **Mullai** (Forest) | 200-999m | > 50 km | ≥ 250 mm/year |
| **Marudham** (Plains) | < 200m | > 50 km | ≥ 250 mm/year |

## Features

- 🌍 **Global Coverage** - Works anywhere in the world
- 📍 **Auto-Detection** - Use browser geolocation for precise location
- 🔍 **Manual Search** - Enter any city, address, or landmark
- 📊 **Terrain Analysis** - View detailed elevation, coast distance, and precipitation data
- 🎨 **Beautiful UI** - Color-coded regions with responsive design
- 💾 **Smart Caching** - Caches API responses for faster repeat queries
- ♿ **Accessible** - WCAG compliant with keyboard navigation

## Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive design with CSS Grid and Flexbox
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JavaScript

### APIs (All Free, No API Keys Required)
- **Browser Geolocation API** - Auto-detect user location
- **Nominatim** (OpenStreetMap) - Geocoding for address search
- **Open-Meteo Elevation API** - Altitude data
- **Open-Meteo Climate API** - Historical precipitation data
- **Custom Haversine Calculation** - Distance to nearest coastline

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API calls

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/ainthinai-classifier.git
   cd ainthinai-classifier
   ```

2. Serve the files using any HTTP server. Examples:

   **Using Python 3:**
   ```bash
   python3 -m http.server 8000
   ```

   **Using Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   ```

   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Usage

1. **Option A - Auto-detect Location:**
   - Click "Allow Location (Most Precise)"
   - Grant location permission when prompted
   - View your Ainthinai classification

2. **Option B - Manual Search:**
   - Enter a location (city, address, or landmark)
   - Click "Search"
   - View the classification

3. **View Results:**
   - See your Ainthinai region name (Tamil and English)
   - Read the description and cultural context
   - Examine terrain parameters that led to the classification

## Project Structure

```
ainthinai-classifier/
├── index.html              # Main HTML page
├── css/
│   └── styles.css          # Stylesheet
├── js/
│   ├── app.js              # Main application controller
│   ├── api-client.js       # API integration
│   ├── terrain-analyzer.js # Classification logic
│   ├── geolocation.js      # Browser location handling
│   └── geocoding.js        # Address to coordinates
├── data/
│   └── regions.json        # Ainthinai region metadata
└── README.md               # This file
```

## Testing Locations

Try these locations to see different Ainthinai classifications:

- **Kurinji (Mountains):** "Mount Everest" or "Himalayas, India"
- **Mullai (Forest):** "Black Forest, Germany" or "Nilgiri Hills, India"
- **Marudham (Plains):** "Kansas, USA" or "Gangetic Plains, India"
- **Neithal (Coastal):** "Chennai, India" or "Miami, USA"
- **Paalai (Arid):** "Sahara Desert" or "Thar Desert, India"

## Deployment

### GitHub Pages

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/ainthinai-classifier.git
   git branch -M main
   git push -u origin main
   ```

4. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages
   - Select "main" branch
   - Click Save

5. Access your site at:
   ```
   https://yourusername.github.io/ainthinai-classifier/
   ```

### Netlify

1. Create a free account at [netlify.com](https://netlify.com)
2. Drag and drop your project folder or connect your GitHub repository
3. Deploy automatically - no configuration needed!

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## API Usage & Rate Limits

- **Nominatim:** 1 request per second (enforced by client-side debouncing)
- **Open-Meteo:** No rate limits for reasonable use
- **Browser Geolocation:** No limits

All API responses are cached in `localStorage` for 24 hours to reduce API calls.

## Future Enhancements

- [ ] Interactive map with Ainthinai region overlay
- [ ] Tamil language interface
- [ ] Share results on social media
- [ ] Location history
- [ ] Cultural information and poetry for each region
- [ ] Progressive Web App (PWA) for offline support
- [ ] Custom location comparisons

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- **Ainthinai Concept:** Ancient Tamil Sangam literature
- **APIs:** Open-Meteo, OpenStreetMap Nominatim
- **Design Inspiration:** Modern web design principles
- **Built with:** Love for Tamil culture and geography

## Acknowledgments

Special thanks to:
- The Tamil Sangam poets who created the Ainthinai classification system
- OpenStreetMap contributors
- Open-Meteo team for providing free weather APIs

## Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

**Built with ancient Tamil wisdom and modern web technology** 🏔️🌲🌾🌊🏜️
