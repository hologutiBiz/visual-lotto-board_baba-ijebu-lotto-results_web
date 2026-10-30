// loadGame.js

import { fetchGameResults } from '../fetchResults.js';
import { gameConfigs } from '../gameConfigs.js';
import { renderGameResults } from '../renderGame.js';
import { showError } from '../../utils/showError.js';

const desktopContainer = document.getElementById('gameContainer');
const mobileContainer = document.getElementById('mobileGameContainer');
const desktopStatus = document.getElementById('statusMessage');
const mobileStatus = document.getElementById('mobileStatusMessage');
const desktopHeading = document.getElementById('desktopGameHeading');
const mobileHeading = document.getElementById('mobileGameHeading');

// Detect game from URL
const slug = window.location.pathname.split('/').pop().replace('.html', '');
const config = gameConfigs.find(cfg => cfg.slug === slug);

if (!config) {
    desktopContainer.innerHTML = `<p>Unknown game: ${slug}</p>`;
    throw new Error(`No config found for slug "${slug}"`);
}

// Mark the active game in both the desktop sidebar and mobile chip strip
document.querySelectorAll('.desktop-game-links .game-link, .mobile-game-switcher .game-chip').forEach(link => {
    if (link.getAttribute('data-slug') === slug) link.classList.add('active');
});

// Set headings to match the current game
if (desktopHeading) desktopHeading.innerHTML = `${config.label} <span style="color:#ff0000;">Results</span>`;
if (mobileHeading) mobileHeading.textContent = `${config.label} Results`;

// Inject Megapot banners (in-content + sticky) — mobile view only
// injectMegapotBanners();

// Load game results directly (no session check)
loadSingleGame();

async function loadSingleGame() {
    try {
        desktopStatus.textContent = `Loading ${config.label} results...`;
        if (mobileStatus) mobileStatus.textContent = `Loading ${config.label} results...`;

        const currentYear = new Date().getFullYear();
        const allResults = await fetchGameResults(config.key, currentYear);
        const data = allResults?.[config.key];

        if (!data) {
            const message = `No ${config.label} data found.`;
            desktopContainer.innerHTML = `<p>${message}</p>`;
            if (mobileContainer) mobileContainer.innerHTML = `<p>${message}</p>`;
            desktopStatus.textContent = '';
            if (mobileStatus) mobileStatus.textContent = '';
            return;
        }

        // Render the same data into both the desktop and mobile containers
        renderGameResults(config.key, data, desktopContainer);
        if (mobileContainer) renderGameResults(config.key, data, mobileContainer);

        desktopStatus.textContent = '';
        if (mobileStatus) mobileStatus.textContent = '';
    } catch (err) {
        console.error("Fetch error:", err);
        const message = err?.message || `Unable to load ${config.label} results due to a network or server issue.`;
        desktopStatus.textContent = message;
        if (mobileStatus) mobileStatus.textContent = message;
        desktopContainer.innerHTML = `<p class="error-message">${message}</p>`;
        if (mobileContainer) mobileContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }
}

// Subscribe & Login buttons (Optional UI links)
function linkButton() {
    document.querySelector("#subscribeBtn")?.addEventListener("click", () => {
        window.location.href = "https://lottoforecast.visuallottoboard.com/subscription";
    });

    document.querySelector("#loginBtn")?.addEventListener("click", () => {
        window.location.href = "https://lottoforecast.visuallottoboard.com/";
    });
}
linkButton();

// Hamburger menu toggle (mobile only — CSS hides this button on desktop)
function initMenuToggle() {
    const toggleBtn = document.getElementById('menuToggle');
    const actions = document.getElementById('headerActions');
    toggleBtn?.addEventListener('click', () => {
        actions.classList.toggle('menu-open');
    });
}
initMenuToggle();
