/**
 * Share Module
 * Tweet, copy link, and download result as image
 */

const ShareModule = {
    currentRegion: null,
    currentLocation: null,
    currentLat: null,
    currentLon: null,

    /**
     * Set the current result context
     */
    setContext(region, location, lat, lon) {
        this.currentRegion = region;
        this.currentLocation = location;
        this.currentLat = lat;
        this.currentLon = lon;
    },

    /**
     * Share on X / Twitter
     */
    shareOnTwitter() {
        if (!this.currentRegion) return;
        const text = `I'm in ${this.currentRegion} 🏔️🌲🌾🌊🏜️ according to the ancient Tamil Ainthinai system!\n\nMy location (${this.currentLocation}) is classified as ${this.currentRegion} — ${this._getEmotionText(this.currentRegion)}.\n\nDiscover yours →`;
        const url = this._buildShareUrl();
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    },

    /**
     * Copy shareable link to clipboard
     */
    async copyLink() {
        const url = this._buildShareUrl();
        try {
            await navigator.clipboard.writeText(url);
            this._showFeedback('✅ Link copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            const inp = document.createElement('input');
            inp.value = url;
            document.body.appendChild(inp);
            inp.select();
            document.execCommand('copy');
            document.body.removeChild(inp);
            this._showFeedback('✅ Link copied!');
        }
    },

    /**
     * Download the result card as a PNG image
     */
    async downloadAsImage() {
        if (typeof html2canvas === 'undefined') {
            this._showFeedback('⚠️ Image download not available');
            return;
        }

        const card = document.getElementById('result-card');
        if (!card) return;

        this._showFeedback('📷 Generating image...');

        try {
            // Temporarily hide the map (canvas from leaflet causes taint issues)
            const mapWrapper = document.getElementById('map-wrapper');
            const mapDisplay = mapWrapper ? mapWrapper.style.display : '';
            if (mapWrapper) mapWrapper.style.display = 'none';

            const canvas = await html2canvas(card, {
                backgroundColor: '#111827',
                scale: 2,
                useCORS: true,
                logging: false
            });

            if (mapWrapper) mapWrapper.style.display = mapDisplay;

            const link = document.createElement('a');
            link.download = `ainthinai-${(this.currentRegion || 'result').toLowerCase()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            this._showFeedback('✅ Image saved!');
        } catch (err) {
            console.error('Screenshot error:', err);
            this._showFeedback('⚠️ Could not generate image');
        }
    },

    /**
     * Build a shareable URL with ?location= query param
     */
    _buildShareUrl() {
        const base = window.location.href.split('?')[0];
        if (this.currentLat !== null && this.currentLon !== null) {
            return `${base}?lat=${this.currentLat.toFixed(4)}&lon=${this.currentLon.toFixed(4)}`;
        }
        if (this.currentLocation) {
            return `${base}?q=${encodeURIComponent(this.currentLocation)}`;
        }
        return base;
    },

    /**
     * Get a short emotion text for the region
     */
    _getEmotionText(region) {
        const map = {
            Kurinji: 'Union & Patience',
            Mullai: 'Waiting & Hope',
            Marudham: 'Domestic Joy',
            Neithal: 'Longing & Separation',
            Paalai: 'Heartache & Journey'
        };
        return map[region] || '';
    },

    /**
     * Show temporary feedback message
     */
    _showFeedback(msg) {
        const el = document.getElementById('share-feedback');
        if (!el) return;
        el.textContent = msg;
        el.style.opacity = '1';
        clearTimeout(this._feedbackTimer);
        this._feedbackTimer = setTimeout(() => {
            el.style.opacity = '0';
        }, 3000);
    }
};
