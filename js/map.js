/**
 * Map Module — Leaflet.js interactive map
 * Shows a colored marker and pulsing zone for the classified region
 */

const MapView = {
    map: null,
    marker: null,
    circle: null,

    /**
     * Render the map centered on the given coordinates
     * with a colored marker matching the region
     */
    render(lat, lon, region, color) {
        const container = document.getElementById('region-map');
        if (!container) return;

        // Tear down existing map if any
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Ensure the container is visible before init
        container.style.display = 'block';

        // Init Leaflet map
        this.map = L.map('region-map', {
            center: [lat, lon],
            zoom: 10,
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: false
        });

        // Dark-mode tile layer (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        // Pulsing circle (region zone indicator)
        this.circle = L.circle([lat, lon], {
            color: color,
            fillColor: color,
            fillOpacity: 0.08,
            weight: 1.5,
            opacity: 0.5,
            radius: 15000  // 15km radius visual
        }).addTo(this.map);

        // Custom colored marker
        const markerHtml = `
            <div style="
                width: 22px; height: 22px;
                background: ${color};
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid rgba(255,255,255,0.9);
                box-shadow: 0 3px 12px rgba(0,0,0,0.5);
            "></div>`;

        const icon = L.divIcon({
            html: markerHtml,
            iconSize: [22, 22],
            iconAnchor: [11, 22],
            popupAnchor: [0, -26],
            className: ''
        });

        this.marker = L.marker([lat, lon], { icon })
            .addTo(this.map)
            .bindPopup(`<strong>${region}</strong><br>${lat.toFixed(4)}°, ${lon.toFixed(4)}°`, {
                className: 'ainthinai-popup'
            })
            .openPopup();

        // Invalidate size after section becomes visible
        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 300);
    },

    /**
     * Clean up the map
     */
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.marker = null;
            this.circle = null;
        }
    }
};
