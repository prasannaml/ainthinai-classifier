/**
 * History Module
 * Stores and renders the last 5 classified locations as clickable chips
 */

const HistoryModule = {
    MAX_ITEMS: 5,
    STORAGE_KEY: 'ainthinai_history_v2',

    /**
     * Save a result to history (deduplicates by coords)
     */
    save(locationName, region, icon, color, lat, lon) {
        const history = this.load();
        // Remove duplicate if same location exists
        const filtered = history.filter(h =>
            Math.abs(h.lat - lat) > 0.01 || Math.abs(h.lon - lon) > 0.01
        );
        // Prepend new entry
        filtered.unshift({ locationName, region, icon, color, lat, lon, ts: Date.now() });
        // Keep only last MAX_ITEMS
        const trimmed = filtered.slice(0, this.MAX_ITEMS);
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
        } catch (e) {
            console.warn('Could not save history:', e);
        }
        this.render();
    },

    /**
     * Load history from localStorage
     */
    load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Clear all history
     */
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.render();
    },

    /**
     * Render history chips into #history-section
     */
    render() {
        const section = document.getElementById('history-section');
        if (!section) return;

        const history = this.load();

        if (history.length === 0) {
            section.innerHTML = '';
            return;
        }

        const chipsHtml = history.map(h => `
            <button class="history-chip" 
                    data-lat="${h.lat}" 
                    data-lon="${h.lon}"
                    data-name="${this._escape(h.locationName)}"
                    title="${this._escape(h.locationName)} — ${h.region}">
                <span class="history-chip-icon">${h.icon}</span>
                <span class="history-chip-name">${this._truncate(h.locationName, 28)}</span>
                <span class="history-chip-region" style="color:${h.color}">${h.region}</span>
            </button>
        `).join('');

        section.innerHTML = `
            <div class="history-header">
                <span class="history-label">🕐 Recent</span>
                <button class="history-clear" id="history-clear-btn">Clear</button>
            </div>
            <div class="history-chips">${chipsHtml}</div>
        `;

        // Bind events
        document.getElementById('history-clear-btn')?.addEventListener('click', () => this.clear());

        section.querySelectorAll('.history-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const lat = parseFloat(chip.dataset.lat);
                const lon = parseFloat(chip.dataset.lon);
                const name = chip.dataset.name;
                // Call into App
                if (typeof App !== 'undefined') {
                    App.classifyAndDisplay(lat, lon, name);
                }
            });
        });
    },

    _escape(str) {
        return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;');
    },

    _truncate(str, maxLen) {
        if (!str) return '';
        // Show just the first meaningful part (city name)
        const first = str.split(',')[0].trim();
        return first.length > maxLen ? first.slice(0, maxLen - 1) + '…' : first;
    }
};
