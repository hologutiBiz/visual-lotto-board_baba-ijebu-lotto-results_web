// loadGame.js

import { fetchGameResults } from '../fetchResults.js';
import { gameConfigs } from '../gameConfigs.js';
import { renderGameResults } from '../renderGame.js';
import { showError } from '../../utils/showError.js';

const container = document.getElementById('gameContainer');
const status = document.getElementById('statusMessage');
const nav = document.querySelector('.each-game-active-wrapper');

// 🧠 Detect game from URL
const slug = window.location.pathname.split('/').pop().replace('.html', '');
const config = gameConfigs.find(cfg => cfg.slug === slug);

if (!config) {
    container.innerHTML = `<p>Unknown game: ${slug}</p>`;
    throw new Error(`No config found for slug "${slug}"`);
}

// 🔗 Build subnavbar with all games
gameConfigs.forEach(cfg => {
    const link = document.createElement('a');
    link.href = `/games/${cfg.slug}.html`;
    link.textContent = cfg.label;
    if (cfg.slug === slug) link.classList.add('active');
    nav.appendChild(link);
});

// Inject Megapot banners (in-content + sticky) on every game page
injectMegapotBanners();

// Load game results directly (no session check)
loadSingleGame();

async function loadSingleGame() {
    try {
        status.textContent = `Loading ${config.label} results...`;
        const allResults = await fetchGameResults();
        const data = allResults[config.key];

        if (!data) {
            container.innerHTML = `<p>No ${config.label} data found.</p>`;
            return;
        }

        renderGameResults(config.key, data, container);
        status.textContent = '';
    } catch (err) {
        console.error("Fetch error:", err);
        showError(`Unable to load ${config.label} results due to a network or server issue.`);
    }
}

// 📬 Subscribe & Login buttons (Optional UI links)
function linkButton() {
    document.querySelector("#subscribeBtn")?.addEventListener("click", () => {
        window.location.href = "https://lottoforecast.visuallottoboard.com/subscription";
    });

    document.querySelector("#loginBtn")?.addEventListener("click", () => {
        window.location.href = "https://lottoforecast.visuallottoboard.com/";
    });
}
linkButton();

// 🎯 Megapot banner injection
function injectMegapotBanners() {
    const MEGAPOT_LINK = "https://megapot.io/?utm_source=visuallotto&ref=NFHHTA";

    // --- In-content banner: insert right before the results container ---
    const inContentWrapper = document.createElement('div');
    inContentWrapper.className = 'megapot-banner-wrapper';
    inContentWrapper.innerHTML = `
        <a href="${MEGAPOT_LINK}" target="_blank" rel="noopener sponsored" aria-label="Megapot - Play the Internet Lottery" id="megapot-link-inarticle" data-banner-position="in_article">
            <img src="/assets/megapot/2184 x 270.png" alt="Megapot - Play to Win" class="megapot-banner megapot-desktop-banner">
            <img src="/assets/megapot/900 x 750.png" alt="Megapot - Play to Win" class="megapot-banner megapot-mobile-banner">
        </a>
    `;
    container.parentNode.insertBefore(inContentWrapper, container);

    // --- Sticky bottom banner ---
    const stickyBanner = document.createElement('div');
    stickyBanner.className = 'megapot-sticky-banner';
    stickyBanner.id = 'megapotSticky';
    stickyBanner.innerHTML = `
            <a href="${MEGAPOT_LINK}" target="_blank" rel="noopener sponsored" aria-label="Megapot - Play the Internet Lottery" id="megapot-link-sticky" data-banner-position="sticky">
                <img src="/assets/megapot/2184 x 270.png" alt="Megapot - Play to Win" class="megapot-sticky-desktop">
                <img src="/assets/megapot/960 x 150.png" alt="Megapot - Play to Win" class="megapot-sticky-mobile">
            </a>
            <button class="megapot-close" id="megapotClose" aria-label="Close ad">&times;</button>
    `;
    document.body.appendChild(stickyBanner);

    document.getElementById('megapotClose')?.addEventListener('click', () => {
        stickyBanner.style.display = 'none';
    });
}